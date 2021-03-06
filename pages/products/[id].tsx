import { useState, useEffect, useCallback } from 'react';
import styles from '../../styles/Home.module.css';
import { Layout } from '../../components/Layout';
import AddToCart from '../../components/AddToCart';
import nextCookies from 'next-cookies';
import Link from 'next/link';
import FormikControl from '../../components/forms/FormikControl';
import { Formik, Form } from 'formik';
import SingleReview from '../../components/Review';
import {
  Id,
  Product,
  ProductCart,
  ProductList,
  Review,
  Reviews,
} from '../../utils/types';
import { GetServerSidePropsContext } from 'next';

type ProductPageProps = {
  cartFromCookies: ProductCart;
  reviewsByProductId: Reviews;
  products: ProductList;
  product: Product;
  index: string;
};

export default function ProductPage(props: ProductPageProps) {
  const [cart, setCart] = useState(props.cartFromCookies);
  const [leaveReview, setLeaveReview] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [edited, setEdited] = useState(false);
  const [reviewsByProductId, setReviewsByProductId] = useState(
    props.reviewsByProductId,
  );
  const [loading, setLoading] = useState(false);

  const updateReviews = useCallback(() => {
    setReviewsByProductId(props.reviewsByProductId);
  }, [props.reviewsByProductId]);

  useEffect(() => {
    updateReviews();
  }, [updateReviews]);

  const products = props.products;
  //make array with all the avaiable product ids
  const allProductIds = products.map((product: Product) => product.id);
  // const reviewsByProductId = props.reviewsByProductId;
  const defaultNumberOfReviewsToShow = 3;
  const numberOfReviewsToShow = showMore
    ? reviewsByProductId.length
    : defaultNumberOfReviewsToShow;

  //the index in the url acceses the id in the array of ids of the products on the server side
  // the pagination functions get the index url from the current index and the length of the array of ids
  function getPrev(index: string, ArrayOfIds: number[]) {
    if (index === '1') {
      return '' + ArrayOfIds.length;
    }
    const next = parseInt(index) - 1;
    return '' + next;
  }

  function getNext(index: string, ArrayOfIds: number[]) {
    if (parseInt(index) === ArrayOfIds.length) {
      return 1 + '';
    } else {
      return parseInt(index) + 1 + '';
    }
  }

  const next = getNext(props.index, allProductIds);
  const prev = getPrev(props.index, allProductIds);
  const product = props.product;

  const getAverageRating = (reviews: Reviews) => {
    if (!reviews) {
      return 'Be the first to leave a review!';
    }
    const averageRating = Number(
      reviews?.reduce((acc, curr) => {
        return acc + curr.rating;
      }, 0) / reviews.length,
    ).toFixed(1);
    if (isNaN(Number(averageRating))) {
      return 'Be the first to leave a review!';
    }

    return 'Average Rating: ' + averageRating + '/5';
  };

  type FormValues = {
    productId: number;
    rating: string;
    reviewText: string;
  };

  async function onSubmit(values: FormValues) {
    const response = await fetch(`/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        review: {
          productId: values.productId,
          rating: values.rating,
          reviewText: values.reviewText,
        },
      }),
    });

    setEdited(!edited);
    updateReviews();
    const newReview: Review = (await response.json()).review;
    setReviewsByProductId([newReview, ...reviewsByProductId]);
    setLeaveReview(false);
    return newReview;
  }
  const radioOptions = [
    {
      key: 1,
      value: 1,
    },
    {
      key: 2,
      value: 2,
    },
    {
      key: 3,
      value: 3,
    },
    {
      key: 4,
      value: 4,
    },
    {
      key: 5,
      value: 5,
    },
  ];

  if (!props.product) {
    return (
      <Layout cart={cart}>
        <div className={styles.singleproductcontainer}>
          <div className={styles.producttitle}>
            Sorry, this droid does not seem to exist
          </div>
        </div>
        <Link href={'/'}>
          <button className={styles.checkoutbutton}>Back to Store</button>
        </Link>
      </Layout>
    );
  }
  return (
    <Layout cart={cart}>
      <Link href={`/products/${prev}`}>
        <div className={styles.pageleft} />
      </Link>
      <Link href={`/products/${next}`}>
        <div className={styles.pageright} />
      </Link>
      <div className={styles.singleproductcontainer}>
        <div className={styles.imagecontainer}>
          <img src={product.url} alt="" />
        </div>
        <div className={styles.producttitle}>{product.name}</div>
        <div className={styles.productdescription}>{product.description}</div>
        <div className={styles.price}>{product.price} Credits</div>
        <AddToCart id={product.id} setCart={setCart} />
        <div className={styles.reviewsection}>
          <div className={styles.averagerating}>
            {getAverageRating(reviewsByProductId)}
          </div>
          {!leaveReview && (
            <button
              data-cy="button-leave-review"
              onClick={() => setLeaveReview(!leaveReview)}
            >
              Leave a review
            </button>
          )}
          {leaveReview && (
            <div data-cy="leave-review-form">
              <Formik
                initialValues={{
                  productId: product.id,
                  rating: '',
                  reviewText: '',
                }}
                onSubmit={onSubmit}
              >
                {(formik) => (
                  <Form translate={''}>
                    <FormikControl
                      control="radio"
                      name="rating"
                      label="Rating"
                      options={radioOptions}
                    />
                    <FormikControl
                      control="textarea"
                      name="reviewText"
                      label="Your review"
                    />
                    <button data-cy="button-send" type="submit">
                      Send
                    </button>
                  </Form>
                )}
              </Formik>
              <button
                data-cy="button-cancel"
                onClick={() => setLeaveReview(!leaveReview)}
              >
                Cancel
              </button>
            </div>
          )}

          {!reviewsByProductId && <div>Reviews</div>}
          <div className={styles.reviewscontainer}>
            {reviewsByProductId.slice(0, numberOfReviewsToShow).map((rev) => {
              return (
                <div
                  id={rev.reviewId.toString()}
                  className={styles.singlereviewcontainer}
                >
                  <SingleReview
                    rev={rev}
                    edited={edited}
                    setEdited={setEdited}
                    setLoading={setLoading}
                    loading={loading}
                    setReviewsByProductId={setReviewsByProductId}
                    reviewsByProductId={reviewsByProductId}
                  />
                </div>
              );
            })}
            {reviewsByProductId.length > defaultNumberOfReviewsToShow && (
              <button onClick={() => setShowMore(!showMore)}>
                {showMore ? 'Show fewer reviews' : 'Show more reviews'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { getReviewsByProductId, getProductById, getProducts } = await import(
    '../../utils/database'
  );
  const products: ProductList = await getProducts();
  const allProductIds: Id[] = products.map((product: Product) => product.id);
  const product = await getProductById(
    allProductIds[Number(context.query.id) - 1],
  );
  const reviewsByProductId = await getReviewsByProductId(
    allProductIds[Number(context.query.id) - 1],
  );
  const allCookies = nextCookies(context);
  const cartFromCookies = allCookies.cart || [];
  const props: any = {};
  props.index = context.query.id;
  props.products = products;
  props.reviewsByProductId = reviewsByProductId || [];
  props.cartFromCookies = cartFromCookies;
  if (product) props.product = product;

  return {
    props: props,
  };
}
