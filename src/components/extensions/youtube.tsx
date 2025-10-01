"use client";

import Youtube from "@tiptap/extension-youtube";
import {
	type NodeViewProps,
	NodeViewWrapper,
	ReactNodeViewRenderer,
} from "@tiptap/react";

export const YoutubeExtension = Youtube.extend({
	draggable: true,

	addNodeView: () => {
		return ReactNodeViewRenderer(TiptapYoutube);
	},
});

function TiptapYoutube(props: NodeViewProps) {
	const { node, selected } = props;

	// Get the YouTube video ID from the src
	const getEmbedUrl = (src: string) => {
		if (!src) return "";

		// If already an embed URL, return it
		if (src.includes("youtube.com/embed/") || src.includes("youtube-nocookie.com/embed/")) {
			return src;
		}

		// Extract video ID from various YouTube URL formats
		let videoId = "";

		// Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
		const watchMatch = src.match(/[?&]v=([^&]+)/);
		if (watchMatch) {
			videoId = watchMatch[1];
		}

		// Short URL: https://youtu.be/VIDEO_ID
		const shortMatch = src.match(/youtu\.be\/([^?]+)/);
		if (shortMatch) {
			videoId = shortMatch[1];
		}

		// Embed URL: https://www.youtube.com/embed/VIDEO_ID
		const embedMatch = src.match(/embed\/([^?]+)/);
		if (embedMatch) {
			videoId = embedMatch[1];
		}

		if (!videoId) return src;

		// Use nocookie domain if configured
		const domain = node.attrs.nocookie
			? "https://www.youtube-nocookie.com"
			: "https://www.youtube.com";

		return `${domain}/embed/${videoId}`;
	};

	const embedUrl = getEmbedUrl(node.attrs.src);
	const width = node.attrs.width || 640;
	const height = node.attrs.height || 480;

	return (
		<NodeViewWrapper
			data-drag-handle
			className="relative flex justify-center"
			style={{
				outline: selected ? "2px solid #3b82f6" : "none",
				borderRadius: "4px",
			}}
		>
			<iframe
				src={embedUrl}
				width={width}
				height={height}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				style={{
					border: 0,
					borderRadius: "4px",
				}}
			/>
		</NodeViewWrapper>
	);
}
