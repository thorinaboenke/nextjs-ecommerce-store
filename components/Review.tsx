import React, {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  FunctionComponent,
} from 'react';
import styles from '../styles/Home.module.css';
import { Review, Reviews } from '../utils/types';

type ReviewProps = {
  rev: Review;
  edited: Boolean;
  setEdited: Dispatch<SetStateAction<boolean>>;
  setReviewsByProductId: Dispatch<SetStateAction<Reviews>>;
  reviewsByProductId: Review[];
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
};

export const SingleReview: FunctionComponent<ReviewProps> = ({
  rev,
  edited,
  setEdited,
  reviewsByProductId,
  setReviewsByProductId,
  setLoading,
}) => {
  const [text, setText] = useState(rev.reviewText);
  const [rating, setRating] = useState(rev.rating);
  const [editReview, setEditReview] = useState(false);

  const outputRatingAsStars = (r: number) => {
    let output = '';
    const filledStar = '★';
    const emptyStar = '☆';
    for (let i = 0; i < r; i++) {
      output += filledStar;
    }
    for (let i = 0; i < 5 - r; i++) {
      output += emptyStar;
    }
    return output;
  };

  const index = reviewsByProductId.indexOf(rev);
  const deleteReview = useCallback(() => {
    setReviewsByProductId(
      reviewsByProductId.filter((item, ind) => {
        return ind !== index;
      }),
    );
  }, [reviewsByProductId, index, setReviewsByProductId]);

  //function that updates the Review list with the changed Item
  const updateReview = useCallback(() => {
    setReviewsByProductId(
      reviewsByProductId.map((review) =>
        review.reviewId !== rev.reviewId
          ? review
          : { ...review, rating: rating, reviewText: text },
      ),
    );
  }, [reviewsByProductId, setReviewsByProductId, rating, text, rev.reviewId]);

  return (
    <>
      {!editReview ? (
        <div cy-data="star-rating" aria-label={rev.rating + 'out of 5 stars'}>
          {outputRatingAsStars(rev.rating)}
        </div>
      ) : (
        <input
          data-cy="edit-review-rating"
          aria-label="edit rating"
          type="number"
          min={1}
          max={5}
          defaultValue={rev.rating.toString()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRating(parseInt(e.currentTarget.value))
          }
        />
      )}
      {!editReview ? (
        <div>{rev.reviewText}</div>
      ) : (
        <input
          data-cy="edit-review-textfield"
          aria-label="edit rating text"
          type="text"
          defaultValue={rev.reviewText}
          onChange={(e) => setText(e.currentTarget.value)}
        />
      )}
      <div className={styles.editbuttons}>
        {editReview && (
          <button
            data-cy="button-delete"
            aria-label="delete review"
            onClick={async () => {
              setLoading(true);

              await fetch(`/api/reviews/${rev.reviewId}`, {
                method: 'DELETE',
              });
              setEditReview(false);
              deleteReview();

              // setReviewsByProductId(reviewsByProductId.splice(index, 1));
              setReviewsByProductId(
                reviewsByProductId.filter((item, ind) => {
                  return ind !== index;
                }),
              );

              setEdited(!edited);
            }}
          >
            Delete
          </button>
        )}
        <button
          data-cy="button-edit-or-cancel"
          onClick={() => setEditReview(!editReview)}
        >
          {!editReview ? 'Edit' : 'Cancel'}
        </button>
        {editReview && (
          <button
            data-cy="button-save-changes"
            onClick={async () => {
              await fetch(`/api/reviews/${rev.reviewId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  review: { reviewText: text, rating: rating },
                }),
              });
              updateReview();
              setEditReview(false);
            }}
          >
            Save Changes
          </button>
        )}
      </div>
    </>
  );
};

export default SingleReview;
