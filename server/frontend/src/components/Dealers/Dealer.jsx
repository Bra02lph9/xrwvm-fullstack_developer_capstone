import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from '../Header/Header';

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(null);

  const params = useParams();
  const id = params.id;

  const backend_url = "http://localhost:3030"; // Node backend
  const dealer_url = `${backend_url}/fetchDealer/${id}`;
  const reviews_url = `${backend_url}/fetchReviews/dealer/${id}`;

  const root_url = window.location.href.substring(0, window.location.href.indexOf("dealer"));
  const post_review = `${root_url}postreview/${id}`;

  // Fetch dealer details
  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);
      if (!res.ok) {
        console.error("Dealer fetch failed:", res.status, res.statusText);
        return;
      }
      const retobj = await res.json();
      console.log("Dealer response:", retobj);

      if (retobj.status === 200 && retobj.dealer.length > 0) {
        setDealer(retobj.dealer[0]);
      }
    } catch (err) {
      console.error("Dealer fetch error:", err);
    }
  };

  // Fetch dealer reviews
  const get_reviews = async () => {
    try {
      const res = await fetch(reviews_url);
      if (!res.ok) {
        console.error("Reviews fetch failed:", res.status, res.statusText);
        return;
      }
      const retobj = await res.json();
      console.log("Reviews response:", retobj);

      if (retobj.status === 200) {
        if (retobj.reviews && retobj.reviews.length > 0) {
          setReviews(retobj.reviews);
        } else {
          setUnreviewed(true);
        }
      }
    } catch (err) {
      console.error("Reviews fetch error:", err);
    }
  };

  // Helper to choose sentiment icon
  const senti_icon = (sentiment) => {
    if (sentiment === "positive") return positive_icon;
    if (sentiment === "negative") return negative_icon;
    return neutral_icon;
  };

  useEffect(() => {
    get_dealer();
    get_reviews();

    if (sessionStorage.getItem("username")) {
      setPostReview(
        <a href={post_review}>
          <img
            src={review_icon}
            style={{ width: '10%', marginLeft: '10px', marginTop: '10px' }}
            alt='Post Review'
          />
        </a>
      );
    }
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>
          {dealer.full_name} {postReview}
        </h1>
        <h4 style={{ color: "grey" }}>
          {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
        </h4>
      </div>

      <div className="reviews_panel">
        {reviews.length === 0 && !unreviewed ? (
          <div>Loading Reviews....</div>
        ) : unreviewed ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review, idx) => (
            <div className="review_panel" key={idx}>
              <img
                src={senti_icon(review.sentiment)}
                className="emotion_icon"
                alt="Sentiment"
              />
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
