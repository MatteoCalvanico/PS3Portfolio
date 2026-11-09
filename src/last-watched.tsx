import cinemaSnapshot from "../public/cinema/last-watched.json";

interface CinemaSnapshot {
  updatedAt: string | null;
  film: {
    title: string;
    year: string | null;
    watchedDate: string;
    rating: number | null;
    poster: string | null;
    url: string;
  } | null;
}

const snapshot: CinemaSnapshot = cinemaSnapshot;

export default function LastWatched() {
  const film = snapshot.film;
  if (!film) {
    return (
      <p className="last-watched-unavailable">
        Last watched is currently unavailable. Visit my Letterboxd diary below.
      </p>
    );
  }

  const stars =
    film.rating === null
      ? null
      : "★".repeat(Math.floor(film.rating)) + (film.rating % 1 ? "½" : "");
  const watchedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${film.watchedDate}T00:00:00Z`));

  return (
    <section className="last-watched" aria-labelledby="last-watched-heading">
      {film.poster ? (
        <img
          className="last-watched-poster"
          src={film.poster}
          alt={`${film.title} poster`}
          width={120}
          height={180}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : null}
      <div>
        <p className="last-watched-label" id="last-watched-heading">
          Last watched · Letterboxd
        </p>
        <a
          className="last-watched-title"
          href={film.url}
          target="_blank"
          rel="noreferrer"
        >
          {film.title}
          {film.year ? <span> ({film.year})</span> : null}
        </a>
        <p className="last-watched-date">
          Watched on <time dateTime={film.watchedDate}>{watchedDate}</time>
        </p>
        {stars ? (
          <p
            className="last-watched-rating"
            aria-label={`Rated ${film.rating} out of 5`}
          >
            {stars}
          </p>
        ) : null}
      </div>
    </section>
  );
}
