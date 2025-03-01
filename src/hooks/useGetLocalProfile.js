import { useEffect, useState } from "react";
import { useActiveWeb3React } from "./index";

const initialState = {
	profileLink: "https://pancakeswap.finance/profile",
	noProfileLink: "https://pancakeswap.finance/profile",
};

/**
 * Note - this will only work if the app is on the same domain
 */
const useGetLocalProfile = () => {
	const [profile, setProfile] = useState(initialState);
	const { account } = useActiveWeb3React();

	useEffect(() => {
		if (account) {
			try {
				const localData = localStorage.getItem(`profile_${account}`);

				if (localData) {
					const localProfile = JSON.parse(localData);

					setProfile((prevProfile) => ({
						...prevProfile,
						username: localProfile.username,
						image: localProfile.avatar,
					}));
				}
			} catch (error) {
				setProfile(initialState);
			}
		} else {
			setProfile(initialState);
		}
	}, [account, setProfile]);

	return profile;
};

export default useGetLocalProfile;
