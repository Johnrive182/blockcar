import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";

export default function MyListedItems({ blockcar, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const loadListedItems = async () => {
    const itemCount = await blockcar.itemCount();
    let listedItems = [];
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await blockcar.items(indx);
      if (i.seller.toLowerCase() === account) {
        const uri = await nft.tokenURI(i.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await blockcar.getTotalPrice(i.itemId);
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        listedItems.push(item);
      }
    }
    setLoading(false);
    setListedItems(listedItems);
  };

  useEffect(() => {
    loadListedItems();
  }, []);
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {listedItems.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card className="card-custom">
                  <Card.Img className="card-img" variant="top" src={item.image} />
                  <Card.Footer>
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2> No assets </h2>
        </main>
      )}
    </div>
  );
}