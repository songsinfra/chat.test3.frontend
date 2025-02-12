import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Button, Image, Input, Text } from "../elements";
import { setChat } from "../redux/modules/user";
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import { getCookie } from "../shared/Cookie";
import axios from "axios";
import TextWrite from "../components/TextWrite";



let msg_check;
axios.defaults.baseURL = "http://13.125.236.134";
const ChatPage = (props) => {
  let sock = new SockJS("http://13.125.236.134/ws-stomp");
  let ws = Stomp.over(sock);
  const dispatch = useDispatch();
  const user_info = useSelector((state) => state.user.user);
  let user_name;
  let user_profile;
  if (user_info) {
    user_name = user_info.userName;
    user_profile = user_info.userProfile;
  }

  const token = getCookie("is_login");
  let url = document.location.href.split("/");
  let room_id = url[url.length - 1];

  const [content, setContent] = React.useState("");
  const [chatLogs, setChatLogs] = React.useState([]);
  const msg = React.useRef();
  const send = () => {
    let logs = chatLogs;
    logs.unshift(content);
    setChatLogs([...logs]);
  };

  const sendMsg = () => {
    console.log(msg)
        ws.send(`/pub/api/chat/message`, {token: token}, JSON.stringify({
          type: "TALK",
          roomId: room_id,
          message: msg.current.value,
          userName: user_name,
          userProfile: user_profile,
        }));
    msg.current.value = ''
  };

  // React.useEffect(() => {
  //   const token = getCookie("is_login");
  //   const option_a = {
  //     url: `/api/chat/room/enter/${room_id}`,
  //     method: "GET",
  //     header: {
  //       token: token,
  //     },
  //   }
  //   axios(option_a).then((response) => {
  //     console.log(response)
  //   }).catch((error)=> {
  //     console.log(error)
  //   })
  //   const option = {
  //     url: "/api/chat/user",
  //     method: "GET",
  //     header: {
  //       token: token,
  //     },
  //   };
  //   axios(option)
  //     .then((response) => {
  //       console.log(response);
  //     })
  //     .catch((error) => console.log(error));
  // }, []);

  // React.useEffect(() => {
  //   ws.connect(
  //     {
  //       token: token,
  //     },
  //     () => {
  //       console.log('보냄')
  //       ws.send(`/pub/api/chat/message`, {token: token}, JSON.stringify({
  //         type: "ENTER",
  //         roomId: room_id,
  //         message: content,
  //         userName: user_name,
  //         userProfile: user_profile,
  //       }));
  //     }
  //   );
  //   // return () => {
  //   //   const token = getCookie("is_login");
  //   //   ws.disconnect(
  //   //     () => {
  //   //       ws.unsubscribe("sub-0");
  //   //     },
  //   //     { token: token }
  //   //   );
  //   // };
  // })

  React.useEffect(() => {
    
    const token = getCookie('is_login')
    const chat_logs = chatLogs;
    const options = {
      url:`/api/chat/message/${room_id}`,
      method:'GET'
    }
    axios(options).then(response => {
      console.log(response.data)
      response.data.forEach(v=>{
        if(v.type === 'TALK'){
          chat_logs.push(v)
        }
      })
      setChatLogs([...chat_logs])
    }).catch(err => console.log(err))
    ws.connect(
      {
        token: token,
      },
      () => {
        ws.send(`/pub/api/chat/message`, {token: token}, JSON.stringify({
          type: "ENTER",
          roomId: room_id,
          message: content,
          userName: user_name,
          userProfile: user_profile,
        }));
        ws.subscribe(`/sub/chat/room/${room_id}`, (data) => {
          console.log('ㅎㅇㅎㅇ')
          console.log(data)
          const newMsg = JSON.parse(data.body);
          console.log(newMsg);
          if(msg_check !== newMsg){
            chat_logs.unshift(newMsg);
            setChatLogs([...chat_logs]);
            console.log(chatLogs)
          }
        });
      }
      );


    return () => {

      ws.send(`/pub/api/chat/message`, {token: token}, JSON.stringify({
        type: "QUIT",
        roomId: room_id,
        message: content,
        userName: user_name,
        userProfile: user_profile,
      }));
      ws.disconnect(
        () => {
          ws.unsubscribe("sub-0");
        },
        { token: token }
      );
    };
  }, []);

  return (
    <React.Fragment>
      <Container>
        <Content>
          <ContentBox>
            {chatLogs.map((v,idx) => {
              if (v.type === "TALK" && v.userName === user_name) {
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ChatBox>
                    <MsgBox>
                      {v.userProfile? <Image src={v.userProfile} size="24" /> : <Image src='https://firebasestorage.googleapis.com/v0/b/react-chat-2b875.appspot.com/o/blankprofile.png?alt=media&token=839ae664-a63d-4e77-92c3-b1030ebde97e' size="24" />}
                      <Text width="auto" NotP margin='auto 0px'>
                        {v.userName} : {v.message}
                      </Text>
                    </MsgBox>
                    <div style={{display:'flex',flexDirection:'row',justifyContent:"flex-end"}}><Text width='auto' size='12px' NotP margin='0px 0px 4px 0px'>{v.timenow}</Text></div>
                      
                    </ChatBox>
                  </div>
                );
              } else if (v.type === "TALK" && v.userName !== user_name) {
                return (
                  <div
                    key={idx}
                    style={{ display: "flex", justifyContent: "flex-start" }}
                  >
                    <ChatBox>
                    <OthersMsgBox>
                      {v.userProfile? <Image src={v.userProfile} size="24" /> : <Image src='https://firebasestorage.googleapis.com/v0/b/react-chat-2b875.appspot.com/o/blankprofile.png?alt=media&token=839ae664-a63d-4e77-92c3-b1030ebde97e' size="24" />}
                      <Text width="auto" NotP margin='auto 0px'>
                        {v.userName} : {v.message}
                      </Text>
                    </OthersMsgBox>
                    <div style={{display:'flex',flexDirection:'row',justifyContent:"flex-start"}}><Text width='auto' size='12px' NotP margin='0px 0px 4px 4px'>{v.timenow}</Text></div>
                      
                    </ChatBox>
                  </div>
                );
              } else {
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "center" }}>
                    {v.message}
                  </div>
                );
              }
            })}
          </ContentBox>
        </Content>
        <TextBox>
          <MsgInput type='text' ref={msg} placeholder='텍스트를 입력하세요.' onKeyPress={(e)=>{
            if(e.key === 'Enter'){
              sendMsg()
            }
          }}/>
          <Button _onClick={sendMsg} width="60px">
            전송
          </Button>
        </TextBox>
      </Container>
    </React.Fragment>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`;

const ContentBox = styled.div`
  overflow: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items:center;
  margin-top: 30px;
`;

const MsgInput = styled.input`
    border: 1px solid #dbdbdb;
    border-radius: 5px;
    width: 100%;
    padding: 12px 4px;
    box-sizing: border-box;
`;

const OthersMsgBox = styled.div`
  display: flex;
  flex-direction: row;
  /* justify-content: flex-end; */
  background-color:white;
  width: auto;
  max-width: 250px;
  height: auto;
  padding: 10px;
  margin: 0px;

  border-radius: 10px 10px 10px 0px;
`;

const ChatBox = styled.div`
  display:flex;
  flex-direction:column;
`;

const MsgBox = styled.div`
  display: flex;
  flex-direction: row;
  background-color: lavender;
  width: auto;
  max-width: 250px;
  height: auto;
  padding: 10px;
  margin: 0px;

  border-radius: 10px 10px 0px 10px;
  /* justify-content: flex-end; */
`;

export default ChatPage;
