using System.Net.WebSockets;
using System.Text;

namespace HarmonicArchiveBackend.Services
{
    public class WebSocketManager
    {
        private readonly List<WebSocket> _sockets = new();

        public void AddSocket(WebSocket socket)
        {
            _sockets.Add(socket);
        }

        public async Task BroadcastMessageAsync(string message)
        {
            var buffer = Encoding.UTF8.GetBytes(message);

            foreach (var socket in _sockets.ToList())
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
                else
                {
                    _sockets.Remove(socket);
                }
            }
        }
    }
}