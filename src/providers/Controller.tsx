import { resetAllSlices, useAppDispatch, useAppSelector } from '@/redux';
import { getTokens } from '@/redux/tokens/selectors';
import React, { useEffect } from 'react';
import { useDialog } from './dialog-provider';
import { ClosureDirection } from '@/components/ui/dialog';
import Button from '@/components/buttonTP';
import { useStytch, useStytchUser } from '@stytch/react';
import { useNavigate } from 'react-router-dom';

const Controller: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const tokens = useAppSelector(getTokens);
    const navigate = useNavigate();
    const { dialog, close } = useDialog();
    const stytch = useStytch();
    const dispatch = useAppDispatch();
    const stytchUser = useStytchUser();

    console.log('stytchUser', stytchUser);

    const signOut = async () => {
        await stytch.session.revoke();
    };


    useEffect(() => {
        if (tokens == null && stytchUser.user !== null) {
            dialog(
                <div className='flex flex-col items-center justify-center space-y-4'>
                    <p>

                        Looks like you've been inactive for a while. Please sign in again to continue.
                    </p>
                    <Button className='mx-auto block'
                        onClick={async () => {
                            await signOut().then(() => {
                                dispatch(resetAllSlices);
                                navigate("/");
                                close();
                            });
                        }}
                    >
                        Sign back in
                    </Button>
                </div>, {
                closureCondition: ClosureDirection.NONE
            }
            )
        }
    }, [])

    return <>{children}</>;
};

export default Controller;