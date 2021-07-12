import React, { useState } from "react";
import { HelpCircle } from "react-feather";

const BAD_SRCS = {};

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, ...rest }) {
	const [, refresh] = useState(0);

	const src = srcs.find((s) => !BAD_SRCS[s]);

	if (src) {
		return (
			<img
				{...rest}
				alt={alt}
				src={src}
				onError={() => {
					if (src) BAD_SRCS[src] = true;
					refresh((i) => i + 1);
				}}
			/>
		);
	}

	return <HelpCircle {...rest} />;
}
