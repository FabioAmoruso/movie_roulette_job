import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.i5nzysh.mongodb.net/movie_roulette`;

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.API_KEY || '';

export const config = {
    mongo: {
        url: MONGO_URL
    },
    api: {
        imageBaseUrl: IMAGE_BASE_URL,
        baseUrl: API_BASE_URL,
        apiKey: API_KEY
    }
}