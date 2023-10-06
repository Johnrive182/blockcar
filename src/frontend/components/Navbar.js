import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import car from "./car.png";

const Navigation = ({ web3Handler, account }) => {

  return (
    <Navbar expand="lg" className="navbar-custom ">
      <Container fluid>
        <Navbar.Brand>
          <img src={car} width="100" height="70" className="" alt="" />
          &nbsp; BlockCar
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse  id="navbarScroll">
          <Nav variant="pills" className="me-auto my-6 my-lg-3" style={{ maxHeight: "150px" }} navbarScroll>
           <Nav.Item>
              <Nav.Link eventKey="link-1" style={{color: "#FFFFFF"}}  as={Link} to="/" >
                Inicio
              </Nav.Link>
              </Nav.Item>
              <Nav.Item>
              <Nav.Link eventKey="link-2" style={{color: "#FFFFFF"}} as={Link} to="/create">
                Crear
              </Nav.Link>
              </Nav.Item>
              <Nav.Item>
              <Nav.Link eventKey="link-3" style={{color: "#FFFFFF"}} as={Link} to="/my-listed-items">
                Mis Creaciones
              </Nav.Link>
              </Nav.Item>
              <Nav.Item>
              <Nav.Link eventKey="link-4" style={{color: "#FFFFFF"}} as={Link} to="/my-purchases">
                Mis Compras
              </Nav.Link>
              </Nav.Item>
          </Nav>
          <Nav>
            {account ? (
              <Nav.Link
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" >{account}</Button>
              </Nav.Link>
            ) : (
              <Button onClick={web3Handler} variant="outline"  >
                Conectar Wallet
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;