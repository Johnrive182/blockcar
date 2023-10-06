import React, { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Buffer } from "buffer";
import Swal from "sweetalert2";

const projectId = "2GN3gMoFd2bLjZjPTB07hYdxFWo";
const projectSecret = "234f3933139e7490ee9900f2f23e10d1";
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  apiPath: "/api/v0",
  headers: {
    authorization: auth,
  },
});

const Create = ({ blockcar, nft }) => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");
  const [motor, setMotor] = useState("");
  const [chasis, setChasis] = useState("");
  const [kilometraje, setKilo] = useState("");
  const [origen, setOrigen] = useState("");
  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file);
        console.log(result);
        setImage(
          `https://nftmarkeplacebrasil.infura-ipfs.io/ipfs/${result.path}`
        );
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };

  const createNFT = async () => {
    if (!image || !price || !placa || !marca || !modelo || !color || !motor || !chasis || !kilometraje || !origen)
      return;
    try {
      const result = await client.add(JSON.stringify({ image, price, placa, marca, modelo, color, motor, chasis, kilometraje, origen})
      );
      mintThenList(result);
    } catch (error) {
      console.log("ipfs uri uload error: ", error);
    }
  };

  const mintThenList = async (result) => {
    const uri = `https://nftmarkeplacebrasil.infura-ipfs.io/ipfs/${result.path}`;
    await (await nft.mint(uri)).wait();
    const id = await nft.tokenCount();
    await await nft.setApprovalForAll(blockcar.address, true);
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await blockcar.makeItem(nft.address, id, listingPrice)).wait();
    Swal.fire({
        icon: "success",
        title: "¡Vehículo creado con exito!",
        width: 800,
        padding: "3em",
        text: `Se ha creado un nuevo vehiculo`,
        backdrop: `
          left top
          no-repeat
        `,
      });
  };

  return (
    <div className="container-fluid mt-4">
      <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: "600px" }}>
        <div className="mx-auto">
          <Row className="g-1">
            <Form.Control type="file" required name="file" onChange={uploadToIPFS}/>
            <Form.Control onChange={(e) => setPlaca(e.target.value)} value={placa} size="lg" required type="text" placeholder="Placa"/>
            <Form.Control onChange={(e) => setMarca(e.target.value)} value={marca} size="lg" required type="text" placeholder="Marca"/>
            <Form.Control onChange={(e) => setModelo(e.target.value)} value={modelo} size="lg" required type="text" placeholder="Modelo"/>
            <Form.Control onChange={(e) => setColor(e.target.value)} value={color} size="lg" required type="text" placeholder="Color"/>
            <Form.Control onChange={(e) => setOrigen(e.target.value)} value={origen} size="lg" required type="text" placeholder="Origen"/>
            <Form.Control onChange={(e) => setKilo(e.target.value)} value={kilometraje} size="lg" required type="text" placeholder="Kilometraje"/>
            <Form.Control onChange={(e) => setMotor(e.target.value)} value={motor} size="lg" required type="text" placeholder="Motor"/>
            <Form.Control onChange={(e) => setChasis(e.target.value)} value={chasis} size="lg" required type="text" placeholder="Chasis"/>
            <Form.Control onChange={(e) => setPrice(e.target.value)} value={price} size="lg" required type="number" placeholder="Precio (ETH)"/>
            <div className="g-grid px-0">
              <Button onClick={createNFT} variant="success" size="lg">
                Registra tu vehiculo!!
              </Button>
            </div>
          </Row>
        </div>
      </main>
    </div>
  );
};

export default Create;