import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {Row, Col, Card, Button, Modal, Image, Container, Table} from "react-bootstrap";
import Swal from "sweetalert2";

const Home = ({ blockcar, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const loadMarketplaceItem = async () => {
    const itemCount = await blockcar.itemCount();
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await blockcar.items(i);
      if (!item.sold) {
        const uri = await nft.tokenURI(item.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await blockcar.getTotalPrice(item.itemId);
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          owner: item.owner,
          placa: metadata.placa,
          modelo: metadata.modelo,
          marca: metadata.marca,
          origen: metadata.origen,
          color: metadata.color,
          kilometraje: metadata.kilometraje,
          motor: metadata.motor,
          chasis: metadata.chasis,
          image: metadata.image,
        });
      }
    }
    setLoading(false);
    setItems(items);
  };

  const buyMarketItem = async (item) => {
    try{
    await (await blockcar.purchaseItem(item.itemId, { value: item.totalPrice })).wait();
    loadMarketplaceItem();
    Swal.fire({
      icon: "success",
      title: "¡Vehículo comprado con exito!",
      width: 800,
      padding: "3em",
      text: `Se ha comprado un nuevo vehiculo`,
      backdrop: `
        left top
        no-repeat
      `,
    });
  }catch (error) {
    console.error('Error al realizar la compra', error);
  }
  };

  const handleShowDetails = async (item) => {
    setShowModal(true);
    setSelectedItem(item);
    try {
      const transactions = await blockcar.getTransactions(item.itemId);
      setTransactions(transactions);
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
    }
  };

  useEffect(() => {
    loadMarketplaceItem();
  }, []);

  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card className="card-custom">
                  <Card.Img className="card-img" variant="top" src={item.image}/>
                  <Card.Body>
                    <Card.Title>{item.marca}</Card.Title>
                    <Card.Text>{item.modelo}</Card.Text>
                    <Card.Text>{item.kilometraje}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button variant="primary" onClick={() => handleShowDetails(item)} size="lg">
                        Detalles
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No assets</h2>
        </main>
      )}
      {selectedItem && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" aria-labelledby="contained-modal-title-vcenter"
          centered backdrop="static" className="modal-custom">
          <Modal.Header closeButton>
            <Modal.Title>Detalles del Vehículo</Modal.Title>
          </Modal.Header>
          <Modal.Body className="grid-example">
            <Container>
              <Row>
                <Col xs={6} md={4}>
                  <Image src={selectedItem.image} />
                </Col>
                <Col xs={6} md={8}>
                  <table striped bordered hover>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Placa</strong>
                        </td>
                        <td>{selectedItem.placa}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Modelo</strong>
                        </td>
                        <td>{selectedItem.modelo}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Marca</strong>
                        </td>
                        <td>{selectedItem.marca}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Origen</strong>
                        </td>
                        <td>{selectedItem.origen}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Color</strong>
                        </td>
                        <td>{selectedItem.color}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Kilometraje</strong>
                        </td>
                        <td>{selectedItem.kilometraje}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Motor</strong>
                        </td>
                        <td>{selectedItem.motor}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Chasis</strong>
                        </td>
                        <td>{selectedItem.chasis}</td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
                <Col xs={12} md={12}>
                  <h4>Historial de Transacciones</h4>
                  <p>Creador del Vehiculo: {selectedItem.seller}</p>
                  {transactions.length === 0 ? (
                    <p>No hay transacciones disponibles para este vehículo.</p>
                  ) : (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Comprador</th>
                          <th>Precio (ETH)</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction, index) => (
                          <tr key={index}>
                            <td>{transaction.buyer}</td>
                            <td>
                              {ethers.utils.formatEther(transaction.price)}
                            </td>
                            <td>
                              {new Date(
                                transaction.timestamp * 1000
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => {buyMarketItem(selectedItem); setShowModal(false);}} variant="success" size="lg">
              Compra por {ethers.utils.formatEther(selectedItem.totalPrice)} ETH
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Home;