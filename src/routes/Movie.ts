import express from 'express';
import controller from '../controllers/Movie';

const router = express.Router();

router.get('/get/:movieId', controller.getMovieById);
router.get('/get/', controller.getMovies);
router.delete('/delete/:movieId', controller.deleteMovie);

export = router;