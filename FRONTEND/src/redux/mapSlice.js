import { createSlice } from "@reduxjs/toolkit"

const storedLocation = localStorage.getItem("location");
const initialLocation = storedLocation ? JSON.parse(storedLocation) : { lat: null, lon: null };

const mapSlice = createSlice({
    name: "map",
    initialState: {
        location: initialLocation,
        address: localStorage.getItem("address") || null,
    },
    reducers: {
        setLocation: (state, action) => {
            const { lat, lon } = action.payload
            state.location.lat = lat
            state.location.lon = lon
        },
        setAddress: (state, action) => {
            state.address = action.payload
        }
    }
});

export const {setLocation, setAddress } = mapSlice.actions;
export default mapSlice.reducer;