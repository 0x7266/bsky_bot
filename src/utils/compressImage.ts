import fs from "fs";
import Jimp from "jimp";

async function compressImage(imgSize: number, imgPath: string, newWidth: number = 1280, newQuality: number = 100) {
	console.log(`------------------------\n🚨 ${imgPath} is too large: ${imgSize}`);
	console.log(`⏳ Resizing...`);
	const image = await Jimp.read(imgPath);
	image.resize(newWidth, Jimp.AUTO);
	await image.writeAsync(imgPath);
	let resizedImgSize = fs.statSync(imgPath).size;
	console.log(`✅ ${imgPath} resized: ${resizedImgSize}`);
	while (resizedImgSize > 976560)  {
		console.log(`🚨 ${imgPath} still too large: ${resizedImgSize}`);
		newWidth *= .8;
		newQuality -= 12;
        	image.resize(newWidth, Jimp.AUTO);
		image.quality(newQuality);
		await image.writeAsync(imgPath);
		resizedImgSize = fs.statSync(imgPath).size;
		console.log(`✅ ${imgPath} resized: ${resizedImgSize}`);
        }
}

export { compressImage };
