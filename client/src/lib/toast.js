import { toast } from 'react-toastify';

export function succsessAlert(text)  {
    toast.dismiss();
    sleep()
    toast.success(text, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    });
}

export function errorAlert(text)  {
    toast.dismiss();
    sleep()
    toast.warn(text, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    });
        
}

const sleep = async (time = 1000) => {
    return await new Promise((res, rej) => {
        setTimeout(() => {
            res(true)
        }, time)
    })
}