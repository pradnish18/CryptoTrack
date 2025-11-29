export default function getColor(data) {
    if (data === null || data === undefined || Number.isNaN(data)) {
        return "text-gray-600";
    }
    return data < 0 ? "text-red-600" : "text-green-600";
}
