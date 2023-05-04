import "dotenv/config";
import fs from "fs";
import Snoowrap from "snoowrap";
import { SubmissionStream } from "snoostorm";
import Jimp from "jimp";
import { postToBsky } from "./at";
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
	// console.log(post);
	try {
		// if ("is_gallery" in post && post.is_gallery) {
		// 	const galleryPost = post as GallerySubmission;
		// 	const metadataKeys = galleryPost.media_metadata;
		// 	Object.keys(galleryPost.media_metadata).map(async (key) => {
		// 		await saveImage(key);
		// 	});
		// }
		const { permalink, title, author, is_video, post_hint } = post;
		if (post.post_hint !== "image") {
			console.log("🚫 Not a valid post format");
			return;
		}
		if (is_video) {
			console.log("🚫 New post is a video");
			return;
		}
		const url = "https://i.redd.it/ny2gw16elgxa1.png"; // test
		const imgId = url.slice(18, url.length - 4);
		const imgPath = `./images/${imgId}`;
		await saveImage(imgId);
		// 	await postToBsky({
		// 		postUrl: `https://reddit.com${permalink}`,
		// 		title,
		// 		author: author.name,
		// 		authorUrl: `https://reddit.com/u/${author.name}`,
		// 		imgPath,
		// 	});
	} catch (error) {
		console.error(error);
	}
});
