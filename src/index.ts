import "dotenv/config";
import fs from "fs";
import Snoowrap from "snoowrap";
import { SubmissionStream } from "snoostorm";
import Jimp from "jimp";
import { postToBsky } from "./at";
import { downloadImage } from "./downloadImage";

const r = new Snoowrap({
	userAgent: "reddit-bot-example-node",
	clientId: process.env.REDDIT_CLIENT_ID,
	clientSecret: process.env.REDDIT_CLIENT_SECRET,
	username: process.env.REDDIT_USER,
	password: process.env.REDDIT_PASSWORD,
});

const stream = new SubmissionStream(r, {
	subreddit: "mechanicalkeyboards",
	limit: 6,
});

stream.on("item", async (post) => {
	try {
		if (post.post_hint !== "image") {
			return;
		}
		const { permalink, url, title, author, is_video } = post;
		// const url = "https://i.redd.it/ny2gw16elgxa1.png"; // test
		const imgPath = `./images/${url.slice(18)}`;
		if (is_video) {
			console.log("🚫 New post is a video");
			return;
		}
		await downloadImage(url, imgPath);
		let imgInfo = fs.statSync(imgPath);
		if (imgInfo.size > 976560) {
			console.log(`🚨 File is too large: ${imgInfo.size}`);
			const image = await Jimp.read(imgPath);
			image.resize(1280, Jimp.AUTO);
			await image.writeAsync(imgPath);
			let resizedImgInfo = fs.statSync(imgPath);
			console.log(`✅ Resized: ${resizedImgInfo.size}`);
		}
		await postToBsky({
			postUrl: `https://reddit.com${permalink}`,
			title,
			author: author.name,
			authorUrl: `https://reddit.com/u/${author.name}`,
			imgPath,
		});
	} catch (error) {
		console.error(error);
	}
});
