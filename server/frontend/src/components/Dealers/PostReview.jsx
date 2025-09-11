import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const id = params.id;

  // Build URLs
  let curr_url = window.location.href;
  let root_url = curr_url.substring(0, curr_url.indexOf("postreview"));
  const dealer_url = root_url + `djangoapp/dealer/${id}`;
  const review_url = root_url + `djangoapp/add_review/`; // ✅ trailing slash
  const carmodels_url = root_url + `djangoapp/get_cars`;

  // Fetch dealer details
  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);
      const retobj = await res.json();
      if (retobj.status === 200 && Array.isArray(retobj.dealer) && retobj.dealer.length > 0) {
        setDealer(retobj.dealer[0]);
      }
    } catch (err) {
      console.error("Error fetching dealer:", err);
    }
  };

  // Fetch car models
  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url);
      const retobj = await res.json();
      if (retobj.CarModels) setCarmodels(retobj.CarModels);
    } catch (err) {
      console.error("Error fetching car models:", err);
    }
  };

  // Post review
  const postreview = async () => {
    let name = sessionStorage.getItem("firstname") + " " + sessionStorage.getItem("lastname");
    if (name.includes("null")) name = sessionStorage.getItem("username");

    if (!model || !review || !date || !year) {
      alert("All details are mandatory");
      return;
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split[1];

    const jsoninput = {
      name: name,
      dealership: id,
      review: review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen,
      car_model: model_chosen,
      car_year: year,
    };

    setLoading(true);
    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsoninput),
      });

      let json;
      try {
        json = await res.json();
      } catch {
        const text = await res.text();
        console.error("Server returned non-JSON response:", text);
        alert("Error posting review");
        setLoading(false);
        return;
      }

      if (json.status === 200) {
        window.location.href = window.location.origin + "/dealer/" + id;
      } else {
        alert("Error posting review: " + json.message);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_dealer();
    get_cars();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}</h1>

        <textarea
          id='review'
          cols='50'
          rows='7'
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className='input_field'>
          Purchase Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className='input_field'>
          Car Make
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="" disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carmodel, idx) => (
              <option key={idx} value={carmodel.CarMake + " " + carmodel.CarModel}>
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>

        <div className='input_field'>
          Car Year
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            max={2023}
            min={2015}
          />
        </div>

        <div>
          <button className='postreview' onClick={postreview} disabled={loading}>
            {loading ? "Posting..." : "Post Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
