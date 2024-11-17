import streamlit as st
import socket
import threading

# Server configuration
SERVER_HOST = '127.0.0.1'
SERVER_PORT = 12345
ADDR = (SERVER_HOST, SERVER_PORT)

# Global variable for the socket (to be used across multiple reruns)
def init_client_socket():
    if 'client_socket' not in st.session_state:
        st.session_state.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            st.session_state.client_socket.connect(ADDR)
            threading.Thread(target=listen_for_messages, daemon=True).start()
        except Exception as e:
            st.error(f"Failed to connect to the server: {e}")

# Function to listen for incoming messages and update Streamlit
def listen_for_messages():
    while True:
        try:
            message = st.session_state.client_socket.recv(1024).decode('utf-8')
            if message:
                if 'messages' not in st.session_state:
                    st.session_state.messages = []
                st.session_state.messages.append(f"Server: {message}")
                st.rerun()  # Refresh the UI to show new messages
        except Exception as e:
            st.error(f"Error receiving message: {e}")
            break

# Function to send a message to the server
def send_message():
    message = st.text_input("Type a message:")
    if st.button('Send') and message:
        try:
            st.session_state.client_socket.send(message.encode('utf-8'))
            if 'messages' not in st.session_state:
                st.session_state.messages = []
            st.session_state.messages.append(f"You: {message}")
            st.rerun()  # Refresh the UI to show the sent message
        except Exception as e:
            st.error(f"Error sending message: {e}")

# Streamlit UI setup
def chat_ui():
    init_client_socket()  # Ensure the client socket is initialized

    st.title("TCP Chat Client")

    # Display chat history
    if 'messages' in st.session_state:
        for msg in st.session_state.messages:
            st.write(msg)

    # Send a new message
    send_message()

if __name__ == "__main__":
    chat_ui()
