import './about.css'

function About() {
    return (
        <>
        <div className="about-container">
            <div className='about-wrap'>
                <h2>How the Website Works</h2>

                <p className='about-intro'>
                    Create an account and get a demo balance of <b>$10,000.00</b> to play with. 
                    List items quickly, bid in real time, and watch leaderboards update live.
                </p>

                <div>
                    <section>
                    <h3>Getting started</h3>
                    <ul>
                        <li>Sign up or log in.</li>
                        <li>List your item with a quick form.</li>
                        <li>Bids are <b>enabled by default</b> on new listings.</li>
                    </ul>

                    <h3>Bidding & winning</h3>
                    <ul>
                        <li>Top bids update in real time on the item page.</li>
                        <li>Owners can toggle bidding on/off at any time.</li>
                        <li>When bidding is disabled, the owner selects one or more winners.</li>
                        <li>Winners get instant notifications; the first to accept buys the item.</li>
                        <li>Once sold, an item can't be altered - it belongs to the buyer.</li>
                    </ul>
                    </section>

                    <section>
                    <h3>Tech stack</h3>
                    <ul>
                        <li><b>Frontend:</b> React + CSS</li>
                        <li><b>Backend:</b> Express.js</li>
                        <li><b>Database:</b> MySQL (mysql2)</li>
                        <li><b>Realtime:</b> socket.io</li>
                        <li><b>HTTP client:</b> Axios</li>
                    </ul>

                    <h3>Security & sessions</h3>
                    <ul>
                        <li>Sessions are handled via Express session middleware (also shared with websockets).</li>
                        <li>No sensitive data is stored in the cookie; it's used to verify access to protected pages.</li>
                        <li>Passwords are hashed with <b>bcrypt</b>.</li>
                    </ul>

                    <h3>Data model</h3>
                    <p>
                        MySQL stores <i>users</i>, <i>items</i>, <i>bids</i>, and <i>messages</i> with proper foreign keys.
                        Each API route or socket event maps to a corresponding SQL query in the server code.
                    </p>
                    </section>
                </div>
            </div>
        </div>

        </>
    )
}

export default About;