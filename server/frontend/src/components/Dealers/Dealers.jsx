import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);

  // Backend URLs
  const dealer_url = "http://localhost:3030/fetchDealers";  
  const dealer_url_by_state_base = "http://localhost:3030/fetchDealers/";  

  // Fetch all dealers
  const get_dealers = async () => {
    try {
      const res = await fetch(dealer_url);
      const retobj = await res.json();
      if (retobj.status === 200 && Array.isArray(retobj.dealers)) {
        const all_dealers = retobj.dealers;
        const statesSet = new Set(all_dealers.map(d => d.state));
        setStates(Array.from(statesSet));
        setDealersList(all_dealers);
      }
    } catch (err) {
      console.error("Error fetching dealers:", err);
      setDealersList([]);
    }
  };

  // Filter dealers by state
  const filterDealers = async (state) => {
    try {
      let url = dealer_url; // default: all dealers
      if (state && state !== "All") {
        url = dealer_url_by_state_base + state;
      }
      const res = await fetch(url);
      const retobj = await res.json();
      if (retobj.status === 200 && Array.isArray(retobj.dealers)) {
        setDealersList(retobj.dealers);
      } else {
        setDealersList([]);
      }
    } catch (err) {
      console.error("Error filtering dealers:", err);
      setDealersList([]);
    }
  };

  useEffect(() => {
    get_dealers();
  }, []);  

  const isLoggedIn = sessionStorage.getItem("username") != null;

  return (
    <div>
      <Header />

      <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select defaultValue="" onChange={(e) => filterDealers(e.target.value)}>
                <option value="" disabled hidden>State</option>
                <option value="All">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </th>
            {isLoggedIn && <th>Review Dealer</th>}
          </tr>
        </thead>
        <tbody>
          {dealersList.map(dealer => (
            <tr key={dealer.id}>
              <td>{dealer.id}</td>
              <td><a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a></td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn && (
                <td>
                  <a href={`/postreview/${dealer.id}`}>
                    <img src={review_icon} className="review_icon" alt="Post Review"/>
                  </a>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;
