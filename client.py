import socket
import threading

# Server configuration
SERVER_HOST = '127.0.0.1'
SERVER_PORT = 12345
ADDR = (SERVER_HOST, SERVER_PORT)

# Function to listen for incoming messages
def listen_for_messages(client_socket):
    while True:
        try:
            message = client_socket.recv(1024).decode('utf-8')
            print(message)
        except:
            print("Error receiving message.")
            break

# Function to send messages to the server
def send_message(client_socket):
    while True:
        message = input("You: ")
        if message.lower() == 'quit':
            client_socket.send(message.encode('utf-8'))
            break
        client_socket.send(message.encode('utf-8'))

def start_client():
    # Create socket and connect to the server
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(ADDR)
    
    # Start a thread to listen for incoming messages
    listen_thread = threading.Thread(target=listen_for_messages, args=(client_socket,))
    listen_thread.start()

    # Start sending messages
    send_message(client_socket)

if __name__ == "__main__":
    start_client()
