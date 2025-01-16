<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Stomp from 'stompjs';
import axios from 'axios';

export default {
  name: 'ChatComponent',
  setup() {
    const stompClient = ref(null);
    const messages = ref([]);
    const inputValue = ref('');

    const eno = 2;
    const user = 'Jane Smith';
    const roomId = '13';

    // 웹소켓 연결 설정
    const connect = () => {
      const socket = new WebSocket('ws://localhost:8080/ws');
      stompClient.value = Stomp.over(socket);
      stompClient.value.connect({}, () => {
        stompClient.value.subscribe(`/sub/chatroom/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          messages.value.push(newMessage);
        });
      });
    };

    // 웹소켓 연결 해제
    const disconnect = () => {
      if (stompClient.value) {
        stompClient.value.disconnect();
      }
    };

    // 기존 채팅 메시지를 서버로부터 가져오는 함수
    const fetchMessages = () => {
      axios.get(`http://localhost:8080/admin/api/v1/chatmessage/chat/${user}`)
          .then(response => {
            messages.value = response.data;
          });
    };

    // 메시지 전송 함수
    const sendMessage = () => {
      if (stompClient.value && inputValue.value) {
        const body = {
          id: eno,
          user: user,
          message: inputValue.value,
          timestamp: new Date().toISOString(),
          roomId: String(roomId),
        };
        stompClient.value.send('/pub/message', {}, JSON.stringify(body));
        axios.post('http://localhost:8080/admin/api/v1/chatmessage/send', body, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
            .then(response => {
              console.log(response);
            })
            .catch(error => {
              console.error('Error:', error);
            });
        inputValue.value = '';
      }
    };

    // 컴포넌트가 마운트되면 웹소켓 연결하고 메시지 불러오기
    onMounted(() => {
      connect();
      fetchMessages();
    });

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    onBeforeUnmount(() => {
      disconnect();
    });

    return {
      messages,
      inputValue,
      sendMessage,
      user
    };
  },
};
</script>

<template>
  <div class="chat-container">
    <!-- 메시지 리스트 출력 -->
    <div class="messages-container">
      <div v-for="(item, index) in messages" :key="index"
           :class="{'message-left': item.user !== user, 'message-right': item.user === user}" class="message">
        <div class="message-content">
          <div class="message-text">{{ item.message }}</div>
          <div class="message-timestamp">{{ new Date(item.timestamp).toLocaleTimeString() }}</div>
        </div>
      </div>
    </div>

    <!-- 입력 필드 -->
    <div class="input-container">
      <input
          v-model="inputValue"
          type="text"
          placeholder="메시지를 입력하세요"
          class="input-field"
      />
      <button @click="sendMessage" class="send-button">입력</button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9f9f9;
  padding: 20px;
  box-sizing: border-box;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 10px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 60%;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  position: relative;
}

.message-left {
  align-self: flex-start;
  background-color: #e0e0e0;
  border-bottom-left-radius: 0;
}

.message-right {
  align-self: flex-end;
  background-color: #4caf50;
  color: white;
  border-bottom-right-radius: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-text {
  margin-bottom: 5px;
}

.message-timestamp {
  font-size: 12px;
  color: #888;
}

.input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-field {
  width: 85%;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.send-button {
  padding: 10px 15px;
  background-color: #4caf50;
  border: none;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #45a049;
}
</style>