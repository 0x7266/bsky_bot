import fs from "fs";
import Jimp from "jimp";

async function compressImage(imgSize: number, imgPath: string, newWidth: number = 1280) {
	console.log(`🚨 ${imgPath} is too large: ${imgSize}`);
	console.log(`⏳ Resizing...`);
	const image = await Jimp.read(imgPath);
	image.resize(newWidth, Jimp.AUTO);
	await image.writeAsync(imgPath);
	let resizedImgSize = fs.statSync(imgPath).size;
	console.log(`✅ ${imgPath} resized: ${resizedImgSize}`);
	if (resizedImgSize > 976560)  {
        	await compressImage(resizedImgSize, imgPath, newWidth * .9);
        }
}

export { compressImage };
