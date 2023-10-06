import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";

export default function MyPurchases({ blockcar, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [itemIdForResale, setItemIdForResale] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const loadPurchasedItems = async () => {
    const itemCount = await blockcar.itemCount();
    let purchases = [];
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await blockcar.items(indx);
      if (i.owner.toLowerCase() === account) {
        const uri = await nft.tokenURI(i.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await blockcar.getTotalPrice(i.itemId);
        let purchasedItem = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        purchases.push(purchasedItem);
      }
    }
    setLoading(false);
    setPurchases(purchases);
  };

  const resellItem = async () => {
    if (itemIdForResale && newPrice) {
      try {
        const item = await blockcar.items(itemIdForResale);
        if (item.sold) {
        }
        await await nft.setApprovalForAll(blockcar.address, true);
        const newPriceInWei = ethers.utils.parseEther(newPrice);
        await blockcar.resellItem(itemIdForResale, newPriceInWei);
        loadPurchasedItems();
        Swal.fire({
          icon: "success",
          title: "¡Vehículo revendido con exito!",
          width: 800,
          padding: "3em",
          text: `Se ha revendido su vehiculo`,
          backdrop: `
            left top
            no-repeat
          `,
        });
        setShowModal(false);
      } catch (error) {
        console.error("Error al realizar la reventa", error);
      }
    }
  };

  useEffect(() => {
    loadPurchasedItems();
  }, []);
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card className="card-custom">
                  <Card.Img className="card-img" variant="top" src={item.image} />
                  <Card.Body>
                    <Card.Text>
                      {ethers.utils.formatEther(item.totalPrice)} ETH
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Button onClick={() => {setItemIdForResale(item.itemId); setShowModal(true);}} variant="primary" className="lg">
                      Revender
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2> No purchases </h2>
        </main>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="modal-custom">
        <Modal.Header closeButton>
          <Modal.Title>Revender Vehículo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newPrice">
            <Form.Label>Nuevo Precio: (ETH)</Form.Label>
            <Form.Control type="text" placeholder="Nuevo Precio " value={newPrice} onChange={(e) => setNewPrice(e.target.value)}/>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {setShowModal(false); resellItem();}}>
            Revender
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}