"use client";
import React, { useState } from "react";
import app from "@/firebase/config";
import { ref, set, getDatabase } from "firebase/database";
import { toast } from "react-toastify";



const Promocode = function () {

    const [promocode, setPromocode] = useState("");
    const [currencyType,setCurrencyType] = useState("")
    const [discount_type, setDiscount_type] = useState("");
    const [discount_value, setDiscount_value] = useState(0);
    let db = getDatabase(app)
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        // console.log("Hii")
        const newDocRef = ref(db, "promo_codes/" + promocode);
        set(newDocRef, {
            currency_type:currencyType,
            discount_type: discount_type,
            discount_value: Number(discount_value)

        }).then(() => {
            toast.success("promocode add successfully")
        }).catch((err) => {
            toast.error(err)
        })





    }

    return (
        <div>
            <form onSubmit={onSubmitHandler}>
                <input type="text" placeholder="promocde" onChange={(e) => setPromocode(e.target.value)} required />
                <input type="text" placeholder="currency_type" onChange={(e)=>setCurrencyType(e.target.value)} required/>
                <input type="text" placeholder="discount_type" onChange={(e) => setDiscount_type(e.target.value)} required />
                <input type="number" placeholder="discount_value" onChange={(e) => setDiscount_value(e.target.value)} required />
                <button type="submit">Submit</button>
            </form>

        </div>
    )
}
export default Promocode;