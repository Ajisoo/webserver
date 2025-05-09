import React, {useState, useRef, useEffect} from 'react';

export default function Home () {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isPaused, setPaused] = useState(false);
  const objects = useRef(null);
  const creatingInfo = useRef({isCreating: false});
  const [distPower, setDistPower] = useState(2);
  const [radiusPower, setRadiusPower] = useState(3);
  const [gravityLimiter, setGravityLimiter] = useState(4);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setCanvasSize({
          width: offsetWidth,
          height: offsetHeight,
        });
        const { top } = containerRef.current.getBoundingClientRect();
        setOffsetY(top);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasSize.width && canvasSize.height && objects.current === null) {
      objects.current = [
        {
          x: canvasSize.width / 2,
          y: canvasSize.height / 2,
          xv: 0,
          yv: 0,
          radius: 100,
          color: "#f8f8f8",
          active: true,
          locked: true,
        },
        {
          x: canvasSize.width / 2 - 300,
          y: canvasSize.height / 2,
          xv: 0,
          yv: -10,
          radius: 25,
          color: "#f8f8f8",
          active: true,
          locked: false,
        },
        {
          x: canvasSize.width / 2 + 300,
          y: canvasSize.height / 2,
          xv: 0,
          yv: 10,
          radius: 25,
          color: "#f8f8f8",
          active: true,
          locked: false,
        }
      ];
    }
  }, [canvasSize]);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
    const ctx = canvas.getContext("2d");
    let lastFrameTime = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (objects.current === null) {
        return;
      }
      objects.current.forEach((obj) => {
        ctx.fillStyle = obj.color;
        if (obj.locked) {
          ctx.fillStyle = "orange";
        }
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        if (isPaused && !obj.locked) {
          ctx.strokeStyle = "#f8f8f8";
          if (Math.hypot(obj.xv*10, obj.yv*10) < obj.radius) {
            ctx.strokeStyle = "#282828"
          }
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x + obj.xv * 10, obj.y + obj.yv * 10);
          ctx.stroke();
        }
      });
    };

    const update = () => {
      if (objects.current === null) {
        return;
      }
      objects.current
        .filter((obj) => !obj.locked)
        .filter((obj) => !obj.held)
        .filter((obj) => obj.active)
        .forEach((obj) =>
        {
          obj.nextStep = objects.current.filter((obj2) => obj2 !== obj).filter((obj2) => obj2.active).reduce((acc, obj2) => {
            const dist = Math.hypot(obj2.x - obj.x, obj2.y - obj.y);
            const finalX = (obj2.x - obj.x)/Math.pow(Math.max((obj.radius + obj2.radius)/4, dist), distPower)*Math.pow(obj2.radius, radiusPower)/Math.pow(10, gravityLimiter);
            const finalY = (obj2.y - obj.y)/Math.pow(Math.max((obj.radius + obj2.radius)/4, dist), distPower)*Math.pow(obj2.radius, radiusPower)/Math.pow(10, gravityLimiter);
            //const finalX = (obj2.x - obj.x)/dist*obj2.radius/1000;
            //const finalY = (obj2.y - obj.y)/dist*obj2.radius/1000;
            return {x: acc.x + finalX, y: acc.y + finalY};
          }, {x: 0, y:0});
        }
      );

      objects.current
        .filter((obj) => !obj.locked)
        .filter((obj) => !obj.held)
        .filter((obj) => obj.active)
        .forEach((obj) =>
      {
        obj.xv = obj.xv + obj.nextStep.x;
        obj.yv = obj.yv + obj.nextStep.y;
        obj.x = obj.x + obj.xv;
        obj.y = obj.y + obj.yv;
      });
    };

    const animate = (timestamp) => {
      const timeSinceLastFrame = timestamp - lastFrameTime;
      if (timeSinceLastFrame >= 1000/60) {
        lastFrameTime = timestamp;
        draw();
        if (!isPaused) {
          update();
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasSize, isPaused, radiusPower, distPower, gravityLimiter]);

  const handleMouseDown = (event) => {
    if (objects.current === null) {
      return;
    }
    if (event.button === 0 && !creatingInfo.isHolding) {
      const objectsPressed = objects.current.toReversed().filter((obj) => {
        return Math.hypot(obj.x - event.pageX, obj.y - event.pageY + offsetY) < obj.radius;
      });
      if (objectsPressed.length > 0) {
        creatingInfo.heldObject = objectsPressed[0];
        creatingInfo.isHolding = true;
        creatingInfo.heldObject.held = true;
        creatingInfo.objectMoved = false;
        return;
      }
    }
    if (event.button === 0 && !creatingInfo.isCreating) {
      creatingInfo.isCreating = true;
      creatingInfo.startX = event.pageX;
      creatingInfo.startY = event.pageY - offsetY;
      creatingInfo.newObject = {
        x: event.pageX,
        y:event.pageY - offsetY,
        xv: 0,
        yv: 0,
        radius: 0,
        color: "#f8f8f8",
        active: false,
        locked: false
      };
      objects.current.push(creatingInfo.newObject);
      return;
    }
    if (event.button === 2 && !creatingInfo.isRightClicked) {
      const objectsPressed = objects.current.toReversed().filter((obj) => {
        return Math.hypot(obj.x - event.pageX, obj.y - event.pageY + offsetY) < obj.radius;
      });
      if (objectsPressed.length > 0) {
        if (isPaused) {
          creatingInfo.objectMoved = false;
          creatingInfo.isRightClicked = true;
          creatingInfo.heldObject = objectsPressed[0];
        } else {
          objectsPressed[0].locked = !objectsPressed[0].locked;
        }
        return;
      }
    }
  };
  const handleMouseMove = (event) => {
    if (objects.current === null) {
      return;
    }
    if (creatingInfo.isCreating) {
      creatingInfo.newObject.radius = Math.hypot(event.pageX-creatingInfo.startX, event.pageY-offsetY-creatingInfo.startY);
    }
    if (creatingInfo.isHolding) {
      creatingInfo.objectMoved = true;
      creatingInfo.heldObject.x = event.pageX;
      creatingInfo.heldObject.y = event.pageY - offsetY;
    }
    if (creatingInfo.isRightClicked) {
      creatingInfo.objectMoved = true;
      creatingInfo.heldObject.xv = (event.pageX - creatingInfo.heldObject.x)/10;
      creatingInfo.heldObject.yv = (event.pageY - creatingInfo.heldObject.y - offsetY)/10;
    }
  };
  const handleMouseUp = (event) => {
    if (objects.current === null) {
      return;
    }
    if (event.button === 0 && creatingInfo.isCreating) {
      creatingInfo.isCreating = false;
      creatingInfo.newObject.active = true;
    }
    if (event.button === 0 && creatingInfo.isHolding) {
      creatingInfo.isHolding = false;
      if (creatingInfo.objectMoved) {
        creatingInfo.heldObject.held = false;
      } else {
        objects.current.splice(objects.current.indexOf(creatingInfo.heldObject), 1);
      }
      creatingInfo.heldObject = null;
    }
    if (event.button === 2 && creatingInfo.isRightClicked) {
      creatingInfo.isRightClicked = false;
      if (!creatingInfo.objectMoved) {
        creatingInfo.heldObject.locked = !creatingInfo.heldObject.locked;
      }
      creatingInfo.heldObject = null;
    }
  };
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px", margin: "5px" }}>
        <button onClick={() => objects.current = []}>
          Clear
        </button>
        <button onClick={() => {
              console.log(objects.current);
              setPaused(!isPaused);
          }}>
          {isPaused ? "Unfreeze" : "Freeze"}
        </button>
        <button onClick={() => {
            if (objects.current) {
              objects.current.forEach((obj) => {
                obj.xv = obj.xv / 10;
                obj.yv = obj.yv / 10;
              });
            }
          }}>
          {"Slow /10"}
        </button>
        <label style={{ display: "flex", alignItems: "center" }}>
          Radius Multiplier: {" "}
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={radiusPower}
            onChange={(e) => {
              setRadiusPower(Number(e.target.value));
            }}
          />
          {radiusPower}
        </label>
        <label style={{ display: "flex", alignItems: "center" }}>
          Distance Multiplier: {" "}
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={distPower}
            onChange={(e) => {
              setDistPower(Number(e.target.value));
            }}
          />
          {distPower}
        </label>
        <label style={{ display: "flex", alignItems: "center" }}>
          Gravity Limiter: {" "}
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={gravityLimiter}
            onChange={(e) => {
              setGravityLimiter(Number(e.target.value));
            }}
          />
          {gravityLimiter}
        </label>
      </div>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: "100%", height: "100%"}}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ display: "block", backgroundColor: "#282828"}} />
      </div>
    </div>
  );
}
