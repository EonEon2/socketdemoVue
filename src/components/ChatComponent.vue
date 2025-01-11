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

    // 웹소켓 연결 설정
    const connect = () => {
      const socket = new WebSocket('ws://localhost:8080/ws');
      stompClient.value = Stomp.over(socket);
      stompClient.value.connect({}, () => {
        stompClient.value.subscribe('/sub/chatroom/1', (message) => {
          const newMessage = JSON.parse(message.body);
          console.log(newMessage);
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
      axios.get('http://localhost:8080/chat/1')
          .then(response => {
            messages.value = response.data;
          });
    };

    // 메시지 전송 함수
    const sendMessage = () => {
      if (stompClient.value && inputValue.value) {
        const body = {
          id: 1,
          name: '테스트1',
          message: inputValue.value,
        };
        stompClient.value.send('/pub/message', {}, JSON.stringify(body));
        inputValue.value = '';
      }
    };

    // 컴포넌트가 마운트되면 웹소켓 연결하고 메시지 불러오기
    onMounted(() => {
      connect();
      // fetchMessages();
    });

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    onBeforeUnmount(() => {
      disconnect();
    });

    return {
      messages,
      inputValue,
      sendMessage,
    };
  },
};
</script>

<template>
  <div>
    <div>
      <!-- 입력 필드 -->
      <input
          v-model="inputValue"
          type="text"
          placeholder="메시지를 입력하세요"
      />
      <!-- 메시지 전송 버튼 -->
      <button @click="sendMessage">입력</button>
    </div>

    <!-- 메시지 리스트 출력 -->
    <div v-for="(item, index) in messages" :key="index" class="list-item">
      {{ item.message }}
    </div>
  </div>
</template>

<style scoped>
.list-item {
  margin-bottom: 10px;
}
</style>