import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authHeaders, formatRs } from "../lib/api";
import { PageHeader } from "../App";
function Icon({ d, size = 18 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
export function MenuManagementPage({ token }) {
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState("items");
    const [search, setSearch] = useState("");
    const [showAddItem, setShowAddItem] = useState(false);
    const [showAddCat, setShowAddCat] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editCat, setEditCat] = useState(null);
    const [itemForm, setItemForm] = useState({
        name: "",
        categoryId: "",
        sellingPrice: 0,
        costPrice: 0,
        preparationTime: 10,
        description: "",
    });
    const [catForm, setCatForm] = useState({
        name: "",
        sortOrder: 1,
    });
    const { data: items = [], isLoading: itemsLoading } = useQuery({
        queryKey: ["menu-items"],
        queryFn: async () => (await api.get("/menu/items", { headers: authHeaders(token) })).data,
    });
    const { data: categories = [], isLoading: catsLoading } = useQuery({
        queryKey: ["menu-categories"],
        queryFn: async () => (await api.get("/menu/categories", { headers: authHeaders(token) })).data,
    });
    // Create Item
    const addItem = async () => {
        if (!itemForm.name || !itemForm.categoryId || itemForm.sellingPrice <= 0)
            return;
        try {
            await api.post("/menu/items", itemForm, { headers: authHeaders(token) });
            setShowAddItem(false);
            setItemForm({ name: "", categoryId: "", sellingPrice: 0, costPrice: 0, preparationTime: 10, description: "" });
            qc.invalidateQueries({ queryKey: ["menu-items"] });
            qc.invalidateQueries({ queryKey: ["menu"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to add menu item");
        }
    };
    // Edit Item
    const updateItem = async () => {
        if (!editItem)
            return;
        try {
            await api.patch(`/menu/items/${editItem.id}`, {
                name: editItem.name,
                sellingPrice: editItem.sellingPrice,
                costPrice: editItem.costPrice,
                preparationTime: editItem.preparationTime,
                description: editItem.description,
                categoryId: editItem.categoryId,
                availability: editItem.availability,
            }, { headers: authHeaders(token) });
            setEditItem(null);
            qc.invalidateQueries({ queryKey: ["menu-items"] });
            qc.invalidateQueries({ queryKey: ["menu"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to update menu item");
        }
    };
    // Delete Item
    const deleteItem = async (id) => {
        if (!confirm("Are you sure you want to delete this menu item?"))
            return;
        try {
            await api.delete(`/menu/items/${id}`, { headers: authHeaders(token) });
            qc.invalidateQueries({ queryKey: ["menu-items"] });
            qc.invalidateQueries({ queryKey: ["menu"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to delete item");
        }
    };
    // Create Category
    const addCategory = async () => {
        if (!catForm.name)
            return;
        try {
            await api.post("/menu/categories", catForm, { headers: authHeaders(token) });
            setShowAddCat(false);
            setCatForm({ name: "", sortOrder: 1 });
            qc.invalidateQueries({ queryKey: ["menu-categories"] });
            qc.invalidateQueries({ queryKey: ["menu"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to add category");
        }
    };
    // Edit Category
    const updateCategory = async () => {
        if (!editCat)
            return;
        try {
            await api.patch(`/menu/categories/${editCat.id}`, {
                name: editCat.name,
                isActive: editCat.isActive,
                sortOrder: editCat.sortOrder,
            }, { headers: authHeaders(token) });
            setEditCat(null);
            qc.invalidateQueries({ queryKey: ["menu-categories"] });
            qc.invalidateQueries({ queryKey: ["menu"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to update category");
        }
    };
    // Delete Category
    const deleteCategory = async (id) => {
        if (!confirm("Are you sure you want to delete this category?"))
            return;
        try {
            await api.delete(`/menu/categories/${id}`, { headers: authHeaders(token) });
            qc.invalidateQueries({ queryKey: ["menu-categories"] });
            qc.invalidateQueries({ queryKey: ["menu"] });
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to delete category");
        }
    };
    const toggleAvailability = async (id, current) => {
        await api.patch(`/menu/items/${id}`, { availability: !current }, { headers: authHeaders(token) });
        qc.invalidateQueries({ queryKey: ["menu-items"] });
        qc.invalidateQueries({ queryKey: ["menu"] });
    };
    const filteredItems = items.filter((i) => !search ||
        i.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.category?.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredCats = categories.filter((c) => !search || c.name?.toLowerCase().includes(search.toLowerCase()));
    const margin = (item) => {
        if (!item.costPrice || !item.sellingPrice)
            return null;
        return Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100);
    };
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Menu Management", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", children: _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsxs("div", { className: "pill-tabs", children: [_jsxs("button", { className: `pill-tab ${activeTab === "items" ? "active" : ""}`, onClick: () => setActiveTab("items"), children: ["Menu Items (", items.length, ")"] }), _jsxs("button", { className: `pill-tab ${activeTab === "categories" ? "active" : ""}`, onClick: () => setActiveTab("categories"), children: ["Categories (", categories.length, ")"] })] }), activeTab === "items" ? (_jsxs("button", { className: "btn btn-gold btn-sm", onClick: () => setShowAddItem(true), children: [_jsx(Icon, { d: "M12 5v14M5 12h14", size: 14 }), "Add Item"] })) : (_jsxs("button", { className: "btn btn-gold btn-sm", onClick: () => setShowAddCat(true), children: [_jsx(Icon, { d: "M12 5v14M5 12h14", size: 14 }), "Add Category"] }))] }) }), _jsxs("div", { className: "page-body", children: [_jsxs("div", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#ec4899" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Total Items" }), _jsx("div", { className: "kpi-value", children: items.length })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#10b981" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M22 11.08V12a10 10 0 11-5.93-9.14", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Active Items" }), _jsx("div", { className: "kpi-value", children: items.filter((i) => i.availability).length })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "#8b5cf6" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M4 6h16M4 12h16M4 18h16", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Menu Categories" }), _jsx("div", { className: "kpi-value", children: categories.length })] }), _jsxs("div", { className: "kpi-card", style: { "--kpi-color": "var(--gold)" }, children: [_jsx("div", { className: "kpi-icon-wrap", children: _jsx(Icon, { d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", size: 16 }) }), _jsx("div", { className: "kpi-label", children: "Average Item Price" }), _jsx("div", { className: "kpi-value", children: items.length > 0 ? formatRs(items.reduce((s, i) => s + i.sellingPrice, 0) / items.length) : "—" })] })] }), _jsx("div", { style: { maxWidth: 360 }, children: _jsx("input", { placeholder: `Search ${activeTab === "items" ? "items or categories" : "categories"}…`, value: search, onChange: (e) => setSearch(e.target.value) }) }), activeTab === "items" ? (
                    /* ITEMS TABLE */
                    _jsxs("div", { className: "card", children: [itemsLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading menu items\u2026"] }), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Item Name" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Selling Price" }), _jsx("th", { children: "Cost Price" }), _jsx("th", { children: "Margin" }), _jsx("th", { children: "Prep Time" }), _jsx("th", { children: "Status" }), _jsx("th", { style: { textAlign: "right" }, children: "Actions" })] }) }), _jsx("tbody", { children: filteredItems.map((item) => {
                                                    const m = margin(item);
                                                    return (_jsxs("tr", { children: [_jsx("td", { className: "font-bold", children: item.name }), _jsx("td", { children: _jsx("span", { className: "badge badge-gold", children: item.category?.name || "Uncategorized" }) }), _jsx("td", { className: "font-mono font-bold text-gold", children: formatRs(item.sellingPrice) }), _jsx("td", { className: "text-muted", style: { fontSize: 12 }, children: item.costPrice > 0 ? formatRs(item.costPrice) : "—" }), _jsx("td", { children: m !== null ? (_jsxs("span", { style: { color: m >= 50 ? "var(--success)" : m >= 30 ? "var(--warning)" : "var(--danger)", fontWeight: 800, fontSize: 12 }, children: [m, "%"] })) : "—" }), _jsxs("td", { className: "text-muted", style: { fontSize: 12 }, children: [item.preparationTime, " min"] }), _jsx("td", { children: _jsx("button", { style: { background: "none", border: "none", cursor: "pointer", padding: 0 }, onClick: () => toggleAvailability(item.id, item.availability), title: "Click to toggle availability", children: _jsxs("span", { className: `badge ${item.availability ? "badge-success" : "badge-danger"}`, children: [_jsx("span", { className: "badge-dot" }), item.availability ? "Active" : "Hidden"] }) }) }), _jsx("td", { children: _jsxs("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" }, children: [_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditItem(item), children: "Edit" }), _jsx("button", { className: "btn btn-danger btn-sm", onClick: () => deleteItem(item.id), children: "Delete" })] }) })] }, item.id));
                                                }) })] }), filteredItems.length === 0 && !itemsLoading && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83C\uDF55" }), _jsx("p", { children: "No menu items found" }), _jsx("small", { children: "Click \"Add Item\" to create your first menu item" })] }))] })] })) : (
                    /* CATEGORIES TABLE */
                    _jsxs("div", { className: "card", children: [catsLoading && _jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "spinner" }), " Loading categories\u2026"] }), _jsxs("div", { className: "table-wrap", children: [_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Category Name" }), _jsx("th", { children: "Sort Order" }), _jsx("th", { children: "Item Count" }), _jsx("th", { style: { textAlign: "right" }, children: "Actions" })] }) }), _jsx("tbody", { children: filteredCats.map((cat) => (_jsxs("tr", { children: [_jsx("td", { className: "font-bold", children: cat.name }), _jsx("td", { className: "mono", children: cat.sortOrder ?? 1 }), _jsxs("td", { className: "text-muted", style: { fontSize: 12 }, children: [items.filter((i) => i.categoryId === cat.id).length, " items registered"] }), _jsx("td", { children: _jsxs("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" }, children: [_jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditCat(cat), children: "Edit" }), _jsx("button", { className: "btn btn-danger btn-sm", onClick: () => deleteCategory(cat.id), children: "Delete" })] }) })] }, cat.id))) })] }), filteredCats.length === 0 && !catsLoading && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83D\uDCC1" }), _jsx("p", { children: "No categories found" })] }))] })] })), showAddItem && (_jsx("div", { className: "modal-overlay", onClick: () => setShowAddItem(false), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("div", { className: "modal-title", children: "Add New Menu Item" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setShowAddItem(false), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Item Name *" }), _jsx("input", { placeholder: "e.g. Chicken Tikka Pizza (Large)", value: itemForm.name, onChange: (e) => setItemForm({ ...itemForm, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Category *" }), _jsxs("select", { value: itemForm.categoryId, onChange: (e) => setItemForm({ ...itemForm, categoryId: e.target.value }), children: [_jsx("option", { value: "", children: "Select category\u2026" }), categories.map((c) => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Selling Price (Rs.) *" }), _jsx("input", { type: "number", min: 1, value: itemForm.sellingPrice || "", onChange: (e) => setItemForm({ ...itemForm, sellingPrice: Number(e.target.value) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Cost Price (Rs.)" }), _jsx("input", { type: "number", min: 0, value: itemForm.costPrice || "", onChange: (e) => setItemForm({ ...itemForm, costPrice: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Preparation Time (minutes)" }), _jsx("input", { type: "number", min: 1, value: itemForm.preparationTime, onChange: (e) => setItemForm({ ...itemForm, preparationTime: Number(e.target.value) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Description" }), _jsx("textarea", { rows: 2, placeholder: "Ingredients, size specs...", value: itemForm.description, onChange: (e) => setItemForm({ ...itemForm, description: e.target.value }) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setShowAddItem(false), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: addItem, children: "Save Item" })] })] }) })), editItem && (_jsx("div", { className: "modal-overlay", onClick: () => setEditItem(null), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: ["Edit Menu Item \u2014 ", editItem.name] }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditItem(null), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Item Name *" }), _jsx("input", { value: editItem.name, onChange: (e) => setEditItem({ ...editItem, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Category *" }), _jsx("select", { value: editItem.categoryId, onChange: (e) => setEditItem({ ...editItem, categoryId: e.target.value }), children: categories.map((c) => _jsx("option", { value: c.id, children: c.name }, c.id)) })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Selling Price (Rs.) *" }), _jsx("input", { type: "number", value: editItem.sellingPrice, onChange: (e) => setEditItem({ ...editItem, sellingPrice: Number(e.target.value) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Cost Price (Rs.)" }), _jsx("input", { type: "number", value: editItem.costPrice || 0, onChange: (e) => setEditItem({ ...editItem, costPrice: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Prep Time (minutes)" }), _jsx("input", { type: "number", value: editItem.preparationTime, onChange: (e) => setEditItem({ ...editItem, preparationTime: Number(e.target.value) }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Status" }), _jsxs("select", { value: editItem.availability ? "active" : "hidden", onChange: (e) => setEditItem({ ...editItem, availability: e.target.value === "active" }), children: [_jsx("option", { value: "active", children: "Active (Visible in POS)" }), _jsx("option", { value: "hidden", children: "Hidden / Out of Stock" })] })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setEditItem(null), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: updateItem, children: "Save Changes" })] })] }) })), showAddCat && (_jsx("div", { className: "modal-overlay", onClick: () => setShowAddCat(false), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("div", { className: "modal-title", children: "Create Menu Category" }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setShowAddCat(false), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Category Name *" }), _jsx("input", { placeholder: "e.g. Specialty Pizzas", value: catForm.name, onChange: (e) => setCatForm({ ...catForm, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Sort Order" }), _jsx("input", { type: "number", value: catForm.sortOrder, onChange: (e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setShowAddCat(false), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: addCategory, children: "Create Category" })] })] }) })), editCat && (_jsx("div", { className: "modal-overlay", onClick: () => setEditCat(null), children: _jsxs("div", { className: "modal-card", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: ["Edit Category \u2014 ", editCat.name] }), _jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => setEditCat(null), children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Category Name *" }), _jsx("input", { value: editCat.name, onChange: (e) => setEditCat({ ...editCat, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Sort Order" }), _jsx("input", { type: "number", value: editCat.sortOrder || 1, onChange: (e) => setEditCat({ ...editCat, sortOrder: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn btn-ghost", onClick: () => setEditCat(null), children: "Cancel" }), _jsx("button", { className: "btn btn-gold", onClick: updateCategory, children: "Update Category" })] })] }) }))] })] }));
}
