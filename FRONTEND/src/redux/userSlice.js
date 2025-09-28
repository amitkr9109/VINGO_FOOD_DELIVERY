import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: JSON.parse(localStorage.getItem("user")) || null,
        currentCity: null,
        shopInMyCity: localStorage.getItem("shop") ? JSON.parse(localStorage.getItem("shop")) : [],
        itemsInMyCity: localStorage.getItem("item") ? JSON.parse(localStorage.getItem("item")) : [],
        cartItems: localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [],
        totalAmount: localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")).reduce((sum, i) => sum + i.price * i.quantity, 0) : 0,
        myOrders: JSON.parse(localStorage.getItem("order")) || [],
        searchItems: JSON.parse(localStorage.getItem("searchitem")) || [],
        socket: null,

    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
            if(action.payload) {
                localStorage.setItem("user", JSON.stringify(action.payload));
            }
            else{
                localStorage.removeItem("user");
            }
        },
        setCity: (state, action) => {
            state.currentCity = action.payload
        },
        setShopInMyCity: (state, action) => {
            state.shopInMyCity = action.payload
            localStorage.setItem("shop", JSON.stringify(action.payload))
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
            localStorage.setItem("item", JSON.stringify(action.payload))
        },
        addToCart: (state, action) => {
            const cartItem = action.payload
            const existingItem = state.cartItems.find(item => item?.id == cartItem.id)
            if(existingItem) {
                existingItem.quantity += cartItem.quantity
            }
            else{
                state.cartItems.push(cartItem)
            }

            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

            localStorage.setItem("cart", JSON.stringify(state.cartItems));
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload
            const items = state.cartItems.find(item => item?.id == id);
            if(items) {
                items.quantity = quantity
            }

            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

            localStorage.setItem("cart", JSON.stringify(state.cartItems));
        },
        removeCartItem: (state, action) => {
            const confirm = window.confirm("Are you sure you want to delete this item?");
            if (!confirm) return;
            state.cartItems = state.cartItems.filter(item => item?.id !== action.payload);
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

            localStorage.setItem("cart", JSON.stringify(state.cartItems));
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload;
            localStorage.setItem("order", JSON.stringify(action.payload));
        },
        addMyOrder: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders];
            localStorage.setItem("order", JSON.stringify(state.myOrders));
        },
        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(odr => odr?._id === orderId);
            if(order) {
                const shopOrder = order.shopOrders.find(odr => odr?.shop?._id === shopId);
                if(shopOrder) {
                    shopOrder.status = status;
                    localStorage.setItem("order", JSON.stringify(state.myOrders));
                }
            }
        },
        setSearchItems: (state, action) => {
            state.searchItems = action.payload;
            localStorage.setItem("searchitem", JSON.stringify(action.payload));
        },
        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        socketRemoveCartItemDeleteByOwner: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item?.id !== action.payload && item?._id !== action.payload);
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
            localStorage.setItem("cart", JSON.stringify(state.cartItems));
        },    
        socketDeleteMyOrder: (state, action) => {
            state.myOrders = state.myOrders.filter(order => order?._id !== action.payload);
            localStorage.setItem("order", JSON.stringify(state.myOrders));
        },

        
    }
});

export const { setUserData, setCity, setShopInMyCity, setItemsInMyCity, addToCart, updateQuantity, removeCartItem, setMyOrders, addMyOrder, updateOrderStatus, setSearchItems, setSocket, socketRemoveCartItemDeleteByOwner, socketDeleteMyOrder } = userSlice.actions;

export default userSlice.reducer;