import { createSlice } from '@reduxjs/toolkit'

const ownerSlice = createSlice({
    name: "owner",
    initialState: {
        myShopData: localStorage.getItem("myShopData") ? JSON.parse(localStorage.getItem("myShopData")) : [],
    },
    reducers: {
        setMyShopData: (state, action) => {
            state.myShopData = action.payload
            localStorage.setItem("myShopData", JSON.stringify(action.payload))
        }
    }
});

export const { setMyShopData } = ownerSlice.actions;

export default ownerSlice.reducer;
