import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import store, { RootState } from '@/store/store';
import { clearAuthError } from '@/store/authSlice';
import { clearChannelError } from '@/store/channelsSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ErrorDisplay = () => {
    const authError = useSelector((state: RootState) => state.authData.error);
    const channelError = useSelector((state: RootState) => state.channelsData.error);

    useEffect(() => {
        if (!authError && !channelError) return;
        const error = authError ?
            ( authError.type !== "auth/validateToken" ? {message: authError.message, type: "auth"} : null )
            :
            ({message: channelError?.message, type: "channel"})

        if(!error) return;

        toast.error(error.message, {
            autoClose: 3000,
            className: "toast-error",
            onClose: () => {
                if (error.type === 'auth') {
                    store.dispatch(clearAuthError());
                } else if (error.type === 'channel') {
                    store.dispatch(clearChannelError());
                }
            },
        });
    }, [authError, channelError, store.dispatch]);
    return null;
};

export default ErrorDisplay;