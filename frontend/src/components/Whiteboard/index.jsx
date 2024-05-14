import React, { useEffect, useState, useLayoutEffect } from "react";
import rough from "roughjs";
const roughGenerator = rough.generator();

const whiteboard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  user,
  socket,
  notes,
  setNotes,
}) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imgURL);
    });
  }, []);

  if (!user?.presenter) {
    return (
      <div className="border border-dark border-3 h-100 w-100 overflow-hidden">
        <img
          src={img}
          style={{
            height: window.innerHeight * 2,
            width: "285%",
          }}
        />
      </div>
    );
  }

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    ctxRef.current.strokeStyle = color;
  }, [color]);

  useLayoutEffect(() => {
    if (canvasRef) {
      const roughCanvas = rough.canvas(canvasRef.current);
      if (elements.length > 0) {
        ctxRef.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }

      elements.forEach((element) => {
        if (element.type === "pencil") {
          roughCanvas.linearPath(element.path, {
            stroke: element.stroke,
            strokeWidth: 3,
            roughness: 0,
          });
        } else if (element.type === "line") {
          roughCanvas.draw(
            roughGenerator.line(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 3,
                roughness: 0,
              }
            )
          );
        }
        if (element.type === "rect") {
          roughCanvas.draw(
            roughGenerator.rectangle(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 3,
                roughness: 0,
              }
            )
          );
        }
      });
      const canvasImage = canvasRef.current.toDataURL();
      socket.emit("whiteboardData", canvasImage);
    }
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    //console.log(offsetX,offsetY)
    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
        },
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "line",
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color,
        },
      ]);
    } else if (tool === "rect") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "rect",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    }
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing) {
      if (tool === "pencil") {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                path: newPath,
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "line") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX,
                height: offsetY,
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "rect") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX,
                height: offsetY - ele.offsetY,
              };
            } else {
              return ele;
            }
          })
        );
      }
    }
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
  };

  const handleNoteChange = (index, newText) => {
    console.log(notes);
    setNotes((prevNotes) =>
      prevNotes.map((note, i) =>
        i === index ? { ...note, text: newText } : note
      )
    );
  };
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="border border-dark border-3 h-100 w-100 overflow-hidden"
    >
      <canvas ref={canvasRef} />
      {notes.map((note, index) => (
        <div
          key={index}
          className="sticky-note"
          style={{
            position: "absolute",
            top: note.y,
            left: note.x,
            backgroundColor: note.color,
            width: "200px",
            height: "200px",
          }}
        >
          <textarea
            style={{
              backgroundColor: "transparent",
              border: "none",
              width: "100%",
              height: "100%",
              padding: "5px",
            }}
            onChange={(e) => handleNoteChange(index, e.target.value)}
          >
            {note.text}
          </textarea>
        </div>
      ))}
    </div>
  );
};

export default whiteboard;
