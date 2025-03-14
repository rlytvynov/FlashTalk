import {useSelector} from "react-redux";
import {RootState} from "./store/store.ts";
import MessageSearch from "./components/message-search/MessageSearch.tsx";


function App() {
    const roomsState = useSelector((state: RootState) => state.roomsData);
    return (
        <>
             <MessageSearch messages={roomsState.rooms[0].messages}/>
        </>
    )
}

export default App
