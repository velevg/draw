const server = require("http").createServer(function (req, res) {
  res.writeHead(200);

  res.end(draw_html);
});

server.listen(process.env.PORT || 3000, process.env.IP || "127.0.0.1");

const io = require("socket.io")(server);

io.on("connection", function (client) {
  client.on("draw", function (data) {
    client.emit("draw", data);

    client.broadcast.emit("draw", data);
  });
});

console.log("up and running");

const draw_html = `
<!doctype html>
<html>
<head>
        <title>Draw</title>
</head>
<body>
        <button type="button" onclick="color = 'red';">Red</button>
        <button type="button" onclick="color = 'green';">Green</button>
        <button type="button" onclick="color = 'blue';">Blue</button>
        <input type="color" onchange="color = this.value;" >
        0<input type="range" min="1" max="30" value="5" onchange="lw = this.value;">30
        <canvas id="myCanvas" width="800" height="600" style="border: 1px solid #000"></canvas>
        <script>
                var x, y, isMouseDown = false, color = 'black', lw = 5;
                var canvas = document.getElementById('myCanvas');
                var context = canvas.getContext('2d');
                canvas.addEventListener('mousedown', function(evt) {
                        isMouseDown = true;
                }, false);
                canvas.addEventListener('mouseup', function(evt) {
                        isMouseDown = false;
                }, false);
                canvas.addEventListener('mousemove', function(evt) {
                        x_old = x;
                        y_old = y;
                        x = evt.clientX - canvas.getBoundingClientRect().left;
                        y = evt.clientY - canvas.getBoundingClientRect().top;
                        if(isMouseDown) {
                                server.emit('draw', [x_old, y_old, x, y, color, lw]);
                        }
                }, false);
        </script>
        <script src="/socket.io/socket.io.js"></script>
        <script>
                var server = io();
                server.on('draw', function (data) {
                        context.beginPath();
                        context.moveTo(data[0], data[1]);
                        context.lineTo(data[2], data[3]);
                        context.strokeStyle = data[4];
                        context.lineWidth = data[5];
                        context.stroke();
                        context.closePath();
                });
        </script>
</body>
</html>
`;
