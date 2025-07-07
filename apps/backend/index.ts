import { app } from "./server";
import { prismaClient } from "db/client";
import { TranscriptGenerator } from "./transcript_generator";
import { SceneGenerator } from "./scene_generator";

app.post("/generate-video", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(401).json({
            message: "Please provide the prompt"
        })
        return;
    }
    const transcript = new TranscriptGenerator();
    const allTranscriptions = await transcript.generate_transcript(prompt);
    const scene_generator = new SceneGenerator(["Hello there, young explorers! Today, we're going to learn about something called 'Bubble Sort'. Imagine you have a bunch of colorful balloons, each with a number on it, but they're all mixed up. Our goal is to arrange them in order from smallest to largest. That's what Bubble Sort helps us do with numbers in a list. Let's see how it works! On the screen, you can see a list of numbers: 5, 3, 8, 4, 2. They're all out of order, just like our balloons. We're going to sort them step by step."], "abc");
    await scene_generator.generate_all_scenes();
})

// const results = [
//     "Hello there, young explorers! Today, we're going to learn about something called 'Bubble Sort'. Imagine you have a bunch of colorful balloons, each with a number on it, but they're all mixed up. Our goal is to arrange them in order from smallest to largest. That's what Bubble Sort helps us do with numbers in a list. Let's see how it works! On the screen, you can see a list of numbers: 5, 3, 8, 4, 2. They're all out of order, just like our balloons. We're going to sort them step by step.",
//     "Alright, let's start with the first two numbers: 5 and 3. We compare them. Is 5 greater than 3? Yes, it is! So, we're going to swap them. Now, our list looks like this: 3, 5, 8, 4, 2.Next, we compare 5 and 8. Is 5 greater than 8? No, it's not. So, we leave them as they are and move on to the next pair: 8 and 4. Is 8 greater than 4? Yes, it is! So, we swap them. Now, our list is: 3, 5, 4, 8, 2. We keep going. Compare 8 and 2. Is 8 greater than 2? Yes, it is! Swap them. Now, our list is: 3, 5, 4, 2, 8. We've reached the end of the list, but we're not done yet! We need to go through the list again to make sure everything is in order. This is what makes it a Bubble Sort – the biggest numbers 'bubble up' to the end of the list one by one.",
//     "Let's go through the list again. Compare 3 and 5. They're in order, so we leave them. Next, 5 and 4. Is 5 greater than 4? Yes, it is! Swap them. Now, our list is: 3, 4, 5, 2, 8.Next, compare 5 and 2. Is 5 greater than 2? Yes, it is! Swap them. Now, our list is: 3, 4, 2, 5, 8.We're almost there! Let's go through the list one more time. Compare 3 and 4. They're in order. Next, 4 and 2. Is 4 greater than 2? Yes, it is! Swap them. Now, our list is: 3, 2, 4, 5, 8.Almost done! Compare 4 and 5. They're in order. And finally, 5 and 8. They're in order too. But wait, we still have one more pass to make sure everything is sorted.",

//     "Let's go through the list one last time. Compare 3 and 2. Is 3 greater than 2? Yes, it is! Swap them. Now, our list is: 2, 3, 4, 5, 8.Next, compare 3 and 4. They're in order. Then, 4 and 5. They're in order. And finally, 5 and 8. They're in order too.Now, look at our list: 2, 3, 4, 5, 8. It's perfectly sorted! We've done it! That's how Bubble Sort works. It's like a little dance where the biggest numbers bubble up to the end of the list one by one.",

//     "And that's Bubble Sort, my young friends! It's a simple way to sort numbers, and it's a great place to start when learning about sorting algorithms. Remember, the key is to keep comparing and swapping until everything is in order. Just like tidying up your toys, it might take a few passes, but you'll get there in the end! Thank you for joining me on this sorting adventure. Until next time, keep exploring and learning!"
// ]