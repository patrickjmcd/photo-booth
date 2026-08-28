import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhotoStripCapture from "./PhotoStripCapture";
import LivePhoto from "./LivePhoto";
import PhotoStrips from "./PhotoStrips";

const App = () => {
    const [sessionPhotos, setSessionPhotos] = useState([]);
    const [photoStrips, setPhotoStrips] = useState([]);

    const fetchData = async () => {
        try {
            let response = await fetch("/data");
            response = await response.json();
            setSessionPhotos(response.currentCapture);
            setPhotoStrips(response.allStrips);
        } catch (e) {
            console.log(e);
        }
    };

    const clearCapture = async () => {
        try {
            fetch("/clear", { method: "POST" });
            setTimeout(() => {
                fetchData();
            }, 500);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-primary text-primary-foreground">
                <div className="container flex h-14 items-center">
                    <h1 className="text-lg font-semibold">Photo Booth</h1>
                </div>
            </header>

            <Tabs defaultValue="take" className="container py-4">
                <TabsList>
                    <TabsTrigger value="take">Take Photos</TabsTrigger>
                    <TabsTrigger value="strips">View Photo Strips</TabsTrigger>
                </TabsList>

                <TabsContent value="take">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
                        <LivePhoto getData={fetchData} />
                        <PhotoStripCapture
                            photos={sessionPhotos}
                            clearData={clearCapture}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="strips">
                    <PhotoStrips photos={photoStrips} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default App;
