import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { storeResetTokenAction } from "../actions/auth-actions";
import { Linking } from "react-native";

const mapDispatchToProps = {
    storeResetToken: storeResetTokenAction,
};

const connector = connect(null, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

const AuthManager: React.FunctionComponent<Props> = ({ storeResetToken }: Props) => {
    const extractResetToken = (url: string) => url.split(/\?reset-token=/)?.[1]

    useEffect(() => {
        const handleLinkChange = ({ url }: { url: string }) => {
            if (url) {
                const resetToken = extractResetToken(url)
                resetToken && storeResetToken(resetToken)
            }
        }
        Linking.addEventListener('url', handleLinkChange)
        Linking.getInitialURL().then(initialUrl => {
            if (initialUrl) {
                const resetToken = extractResetToken(initialUrl)
                resetToken && storeResetToken(resetToken)
            }
        })
        return () => {
            Linking.removeEventListener('url', handleLinkChange)
        }
    }, [])
    return null;
};

export default connector(AuthManager);
