import "./index.css";
import React, { useState, useRef, useEffect } from "react";
import Whiteboard from "../../components/Whiteboard";
import Chat from "../../components/ChatBar";
import Header from "../../components/Forms/Header";
import Users from "../../components/allUser/Users";
import Modal from "../../components/modal/Modal";

const RoomPage = ({ user, socket, users }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [openedChatTab, setOpenedChatTab] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [openedStickyTab, setOpenedStikcyTab] = useState(false);
  const [newNoteToAdd, setNewNoteToAdd] = useState(null);
  const [notes, setNotes] = useState([]);

  const colors = [
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "#fcb8b3",
    "#b3fcc4",
  ];

  useEffect(() => {
    return () => {
      socket.emit("userLeft", user);
    };
  }, []);

  //undo functionality
  const undo = () => {
    setHistory((prevHistory) => [
      ...prevHistory,
      elements[elements.length - 1],
    ]);
    setElements((prevElements) =>
      prevElements.slice(0, prevElements.length - 1)
    );
  };

  // redo functionality
  const redo = () => {
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1],
    ]);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillRect = "white";
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setElements([]);
  };

  const handleColorChange = (color) => {
    console.log("color", color, notes);
    document.body.style.cursor = "crosshair";
    setNewNoteToAdd({
      text: "",
      color: color,
    });
  };

  const handleClickOnWhiteboard = (e) => {
    document.body.style.cursor = "auto";
    const x = e.clientX;
    const y = e.clientY;
    console.log("x-", x, "Y-", y);
    if (newNoteToAdd) {
      console.log("newNoteToAdd", newNoteToAdd);
      setNotes([
        ...notes,
        {
          ...newNoteToAdd,
          x: x,
          y: y,
        },
      ]);
      setNewNoteToAdd(null);
    }
  };
  return (
    <div className="row">
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          position: "absolute",
          top: "3%",
        }}
      >
        <div>
          <button
            className="button-35"
            type="button"
            style={{
              height: "40px",
              width: "100px",
              padding: "1px",
              margin: "10px",
            }}
            // onClick={() => setOpenedUserTab(true)}
            onClick={() => setShowUserModal(true)}
          >
            Users
          </button>

          <button
            className="button-35"
            type="button"
            style={{
              height: "40px",
              width: "100px",
              padding: "1px",
            }}
            onClick={() => setOpenedChatTab(true)}
          >
            Chats
          </button>
        </div>
      </div>

      <Modal
        showUserModal={showUserModal}
        setShowUserModal={setShowUserModal}
        users={users}
        user={user}
      />

      {openedUserTab && (
        <Users users={users} setOpenedUserTab={setOpenedUserTab} user={user} />
      )}

      {openedChatTab && (
        <Chat setOpenedChatTab={setOpenedChatTab} socket={socket} />
      )}
      {/* <h1 className="text-center py-4 ">CollaborateBoard <span className="text-primary">[Users Online:{users.length}]</span></h1> */}

      {user && user.presenter && (
        <div className="main_bar">
          <div className="drawing_shapes">
            <div className="drawshape">
              <label htmlFor="pencil">Pencil</label>
              <input
                type="radio"
                name="tool"
                value="pencil"
                id="pencil"
                checked={tool === "pencil"}
                onChange={(e) => setTool(e.target.value)}
              />
            </div>

            <div className="drawshape">
              <label htmlFor="line">Line</label>
              <input
                type="radio"
                name="tool"
                value="line"
                id="line"
                checked={tool === "line"}
                onChange={(e) => setTool(e.target.value)}
              />
            </div>

            <div className="drawshape">
              <label htmlFor="rect">Rectangle </label>
              <input
                type="radio"
                name="tool"
                value="rect"
                id="rect"
                checked={tool === "rect"}
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
          </div>

          <div className="select_color_div">
            <label htmlFor="color">Select Color:</label>
            <input
              type="color"
              id="color"
              className="mt-1 ms-3"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="URbutton">
            <button
              className="undobtn"
              disabled={elements.length === 0}
              onClick={() => undo()}
            >
              Undo
            </button>
            <button
              className="redobtn"
              disabled={history.length < 1}
              onClick={() => redo()}
            >
              Redo
            </button>
          </div>

          <div className="clearCanvasbtn">
            <button className="btn btn-danger" onClick={handleClearCanvas}>
              Clear Canvas
            </button>
          </div>

          <div className="createNotebtn" style={{ position: "relative" }}>
            <button
              className="btn btn-info"
              onClick={() => setOpenedStikcyTab((prev) => !prev)}
            >
              Create Note
            </button>
            {openedStickyTab && (
              <div
                style={{
                  position: "absolute",
                  border: "1px solid black",
                  backgroundColor: "white",
                  width: "170px",
                  height: "100px",
                  left: "0px",
                  top: "40px",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {colors.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: color,
                      width: "30px",
                      height: "30px",
                      margin: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleColorChange(color)}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className="col-md-10 mx-auto mt-3 canvas-box"
        style={{ display: "flex" }}
        onClick={handleClickOnWhiteboard}
      >
        <Whiteboard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
          notes={notes}
          setNotes={setNotes}
        />
      </div>
    </div>
  );
};
export default RoomPage;

/* CSS */
