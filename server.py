import socket
import threading

# Server configuration
SERVER_HOST = '127.0.0.1'
SERVER_PORT = 12345
ADDR = (SERVER_HOST, SERVER_PORT)

# List to keep track of all connected clients
clients = []

# Function to handle communication with a single client
def handle_client(client_socket, client_address):
    print(f"New connection from {client_address}")
    
    # Add the client to the list
    clients.append(client_socket)
    
    # Listen for incoming messages from the client
    try:
        while True:
            message = client_socket.recv(1024).decode('utf-8')
            if message.lower() == 'quit':
                break
            print(f"Message from {client_address}: {message}")
            # Broadcast the message to all clients
            broadcast(message, client_socket)
    except:
        print(f"Connection with {client_address} lost.")
    finally:
        # Remove client from the list and close the connection
        clients.remove(client_socket)
        client_socket.close()

# Function to broadcast a message to all connected clients
def broadcast(message, client_socket):
    for client in clients:
        if client != client_socket:
            try:
                client.send(message.encode('utf-8'))
            except:
                clients.remove(client)

# Start the server and accept incoming connections
def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(ADDR)
    server_socket.listen(5)
    print(f"Server started on {SERVER_HOST}:{SERVER_PORT}")
    
    while True:
        client_socket, client_address = server_socket.accept()
        client_thread = threading.Thread(target=handle_client, args=(client_socket, client_address))
        client_thread.start()

if __name__ == "__main__":
    start_server()
