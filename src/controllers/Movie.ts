import mongoose from "mongoose";
import Movie, { IMovie, IProvider } from "../models/Movie";
import axios from "axios";
import { config } from "../config/config";
import Logging from "../library/Logging";

/** Get all movies from TMDB API*/
async function getTMDBMovies(pageNumber: number) {
    try {
        const movieRes = await axios.get(`${config.api.baseUrl}/movie/top_rated?page=${pageNumber}`, {
            headers: {
                'Authorization': `Bearer ${config.api.apiKey}`,
                'accept': 'application/json'
            }
        });

        return movieRes.data;
    } catch (error) {
        Logging.error(error);
    }
}

/** Get all providers available for a single movie from TMDB API */
async function getTMDBProviders(movieId: number) {
    try {
        const providerRes = await axios.get(`${config.api.baseUrl}/movie/${movieId}/watch/providers`, {
            headers: {
                'Authorization': `Bearer ${config.api.apiKey}`,
                'accept': 'application/json'
            }
        });

        return providerRes.data.results;
    } catch (error) {
        Logging.error(error);
    }
}

/** Delete all documents */
async function clearCollections() {
    const collections = mongoose.connection.collections;

    await Promise.all(Object.values(collections).map(async (collection) => {
        await collection.deleteMany({});
    }));
}

/** Save data to MongoDB */
async function saveToMongo() {
    try {
        let pageNumber: number = 1;

        //Get the total page number needed to loop the correct amount of times
        const moviesTotalPages = await getTMDBMovies(pageNumber);

        for (let i = 0; i < moviesTotalPages.total_pages; i++) {

            //Get the data of all movies by passing the progressive page number
            const movieResponse = await getTMDBMovies(pageNumber);

            for (const movie of movieResponse.results) {

                const movieId: number = movie.id;

                //Get the providers available for this movie
                const providers = await getTMDBProviders(movieId);

                //Only available in IT
                //TODO: IMPLEMENT AVAILABLE REGION BASED ON USER'S REGION
                if ("IT" in providers) {

                    //Not every movie has the flatrate attribute (which contains the streming providers) so we check if the attribute exists
                    if ("flatrate" in providers.IT) {

                        //Check if the movie exists in the DB
                        const movieExists = await Movie.findById(movieId);

                        //If it doesn't exists we create it
                        //TODO: Implement update if the movie exists
                        if (!movieExists) {

                            const providersArr: IProvider[] = [...providers.IT.flatrate];

                            const movieToCreate: IMovie = new Movie({
                                _id: movie.id,
                                title: movie.title,
                                overview: movie.overview,
                                backdropPath: `${config.api.imageBaseUrl}${movie.backdrop_path}`,
                                posterPath: `${config.api.imageBaseUrl}${movie.poster_path}`,
                                adult: movie.adult,
                                originalLanguage: movie.original_language,
                                genreIds: movie.genre_ids,
                                popularity: movie.popularity,
                                voteAverage: movie.vote_average,
                                releaseDate: movie.release_date,
                                providers: providersArr
                            });

                            // movieToCreate.save();
                        }
                    }
                }
            }
            pageNumber++;
        }

        Logging.info('Process finished');

        mongoose.connection.close().then(() => {
            Logging.info('Connection closed');
        });
    } catch (error) {
        Logging.error(error);
    }
}

export default { saveToMongo, clearCollections };