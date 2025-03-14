import { useState, useEffect } from "react";

const useLocalStorage = <T,>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Error while writing localStorage item", error);
        }
    }, [key, value]);

    return [value, setValue] as const;
};

export default useLocalStorage;
