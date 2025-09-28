import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

const AllItemsCard = ({ data }) => {
    const navigate = useNavigate();

    const deleteHandler = async () => {

        const confirm = window.confirm("Are you sure you want to delete this item?");
        if (!confirm) return;

        try {
           const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/items/delete/${data._id}`, { withCredentials: true });
            if(response.data) {
                toast.success("Item deleted successfully");
                window.location.reload();
            }
        } catch (error) {
            throw error;
        }
    }

  return (
    <>
        <main className='w-full max-w-3xl bg-white flex flex-col rounded-md shadow-md overflow-hidden border border-[#ff4d2d] py-2'>
            <div className="flex md:gap-[20vw] px-2 py-2 gap-5">
                <div className="image-div md:w-48 w-36 h-full flex-shrink-0 bg-gray-50">
                    <img src={data?.image} alt="" className='w-full h-full object-cover rounded-md' />
                </div>
                <div className="details-div">
                    <h1 className='capitalize'><span className='font-semibold'>Name :-</span> {data?.name}</h1>
                    <h2><span className='font-semibold'>Category :-</span> {data?.category}</h2>
                    <h2><span className='font-semibold'>FoodType:- :-</span> {data?.foodType}</h2>
                    <h2><span className='font-semibold'>Price:- :-</span> ₹{data?.price}</h2> 
                </div>
            </div>
            <div className="update-delete-div flex items-center justify-between p-2">
                <p onClick={() => navigate(`/edit-item/${data._id}`)} className='text-blue-600 font-semibold cursor-pointer active:scale-95'>Edit <i className="ri-pencil-line"></i></p>
                <p onClick={() => deleteHandler()} className='text-red-600 font-semibold cursor-pointer active:scale-95'>Delete <i className="ri-delete-bin-line"></i></p>
            </div>
        </main>
    </>
  )
}

export default AllItemsCard;
