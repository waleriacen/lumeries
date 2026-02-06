'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

export default function ProductDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [text, setText] = useState('Your Text');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(40);

  // Initialize Fabric.js Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: '#ffffff',
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Add Text to Canvas
  const addText = () => {
    if (!canvas) return;

    const textObj = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'Arial',
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  };

  // Add Image to Canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;

      fabric.Image.fromURL(imgUrl, (img) => {
        img.scaleToWidth(200);
        img.set({
          left: 100,
          top: 200,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };

    reader.readAsDataURL(file);
  };

  // Delete selected object
  const deleteSelected = () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  // Export Design as PNG
  const exportDesign = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution for printing
    });

    // Download the image
    const link = document.createElement('a');
    link.download = 'custom-design.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Toolbar */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Design Tools</h2>

        {/* Text Tool */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Add Text</h3>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            placeholder="Enter text"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="10"
                max="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <button
            onClick={addText}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition"
          >
            Add Text
          </button>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Add Image</h3>
          <label className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block text-center transition">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Delete & Export */}
        <div className="space-y-2">
          <button
            onClick={deleteSelected}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition"
          >
            Delete Selected
          </button>
          <button
            onClick={exportDesign}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition"
          >
            Export Design (PNG)
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">Tips:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Click objects to select and move them</li>
            <li>• Drag corners to resize</li>
            <li>• Rotate using the handle</li>
            <li>• Export creates a print-ready PNG</li>
          </ul>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="lg:col-span-2">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Design Area</h2>
          <div className="flex justify-center items-center">
            <div className="relative" style={{ width: 400, height: 500 }}>
              {/* T-Shirt Background (simplified) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg" />
              </div>

              {/* Canvas Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <canvas ref={canvasRef} className="border-2 border-dashed border-gray-400" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Design your custom product on the canvas above</p>
          </div>
        </div>
      </div>
    </div>
  );
}
