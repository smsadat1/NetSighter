export default function Search({ handleSearch }) {
    return (
        <search>
            <form onSubmit={handleSearch}>
                <input
                    id="site-search"
                    type="search"
                    name="q"
                    placeholder="IP / HOST / DOMAIN"
                    required
                />
                <button type="submit">→</button>
            </form>
        </search>
    );
}