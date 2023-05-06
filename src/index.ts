import "dotenv/config";
import fs from "fs";
import Snoowrap from "snoowrap";
import { SubmissionStream } from "snoostorm";
import Jimp from "jimp";
import { postToBsky } from "./utils/postToBsky";
import { saveImage } from "./utils/saveImage";
import { GallerySubmission } from "./interfaces/GallerySubmission";

const r = new Snoowrap({
	userAgent: "reddit-bot-example-node",
	clientId: process.env.REDDIT_CLIENT_ID,
	clientSecret: process.env.REDDIT_CLIENT_SECRET,
	username: process.env.REDDIT_USER,
	password: process.env.REDDIT_PASSWORD,
});

const stream = new SubmissionStream(r, {
	subreddit: "mechanicalkeyboards",
	limit: 1,
});

stream.on("item", async (post: Snoowrap.Submission) => {
	try {
		if ("is_gallery" in post && post.is_gallery) {
			const imgPaths: string[] = [];
			const galleryPost = post as GallerySubmission;
			const metadataKeys = galleryPost.media_metadata;
			for (const key of Object.keys(galleryPost.media_metadata)) {
				const imageIdAndFormat = `${key}.${galleryPost.media_metadata[
					key
				].m.slice(6)}`;
				imgPaths.push(`./images/${imageIdAndFormat}`);
				await saveImage(imageIdAndFormat);
			}
			postToBsky({
				postUrl: `https://reddit.com${post.permalink}`,
				title: post.title,
				author: post.author.name,
				authorUrl: `https://reddit.com/u/${post.author.name}`,
				imgPaths,
			});
		}
		if (post.post_hint === "image") {
			const imgIdAndFormat = post.url.slice(18);
			const imgPath = `./images/${imgIdAndFormat}`;
			await saveImage(imgIdAndFormat);
			await postToBsky({
				postUrl: `https://reddit.com${post.permalink}`,
				title: post.title,
				author: post.author.name,
				authorUrl: `https://reddit.com/u/${post.author.name}`,
				imgPaths: [`./images/${imgIdAndFormat}`],
			});
		}
		if (post.is_video) {
			console.log("🚫 New post is a video");
			return;
		}
	} catch (error) {
		console.error(error);
	}
});
