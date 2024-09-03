import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';

function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts
    axios.get(`${process.env.REACT_APP_API_URL}/posts`)
      .then(response => {
        // Initialize likes as an empty array if not provided
        /*const postsWithLikes = response.data.map(post => ({
          ...post,
          likes: post.likes || []
        }));*/
        setPosts(response.data);
        setFilteredPosts(response.data);
        //setPosts(postsWithLikes);
        //setFilteredPosts(postsWithLikes);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
      //error => setError('Error fetching posts')

    // Fetch user profile
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        headers: { 'x-auth-token': token }
      })
      .then(response => setUser(response.data))
      .catch(error => setError('Must login to create post.'));
    }
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setFilteredPosts(posts.filter(post =>
      post.title.toLowerCase().includes(e.target.value.toLowerCase())
    ));
  };

  // Handle like
  const handleLike = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/posts/${id}/like`, {}, {
        headers: { 'x-auth-token': token }
      });
      // Refresh posts to get updated likes
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts`);
      const postsWithLikes = response.data.map(post => ({
        ...post,
        likes: post.likes || []
      }));
      setPosts(postsWithLikes);
      setFilteredPosts(postsWithLikes);
    } catch (error) {
      setError(error.response?.data?.message || 'Error liking post');
    }
  };


    // Handle unlike
    const handleUnlike = async (id) => {
      const token = localStorage.getItem('token');
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/posts/${id}/unlike`, {}, {
          headers: { 'x-auth-token': token }
        });
      } catch (error) {
        console.error('Error unliking post', error);
      }
    };

  // Handle delete
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/posts/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setPosts(posts.filter(post => post._id !== id));
      setFilteredPosts(filteredPosts.filter(post => post._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting post');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Container className="homepage-container">
      <header className="text-center my-4">
        <h1 className="text-primary retro-title">Blog Posts</h1>
      </header>
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
          {user && (
            <div className="mb-4 text-center">
              <p className="mb-1 text-light">Welcome, <strong>{user.username}</strong>!</p>
              <Button variant="secondary" onClick={handleLogout}>Logout</Button>
            </div>
          )}
          {!user && (
            <div className="mb-4 text-center">
              <Link to="/login">
                <Button variant="primary" className="me-2">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </div>
          )}
          <Form className="mb-4">
            <Form.Group controlId="search">
              <Form.Control
                type="text"
                placeholder="Search by title"
                value={searchTerm}
                onChange={handleSearch}
                className="retro-input"
              />
            </Form.Group>
          </Form>
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
          <div className="text-center mb-4">
            <Link to="/create">
              <Button variant="primary">Create New Post</Button>
            </Link>
          </div>
          <Row>
            {filteredPosts.length === 0 ? (
              <Col>
                <Alert variant="info" className="text-center">No posts available</Alert>
              </Col>
            ) : (
              filteredPosts.map(post => (
                <Col md={6} lg={4} key={post._id} className="mb-4">
                  <Card className="shadow-sm retro-card">
                    <Card.Body>
                      <Card.Title className="retro-card-title">{post.title}</Card.Title>
                      <Card.Text>
                        {post.content.substring(0, 150)}...
                      </Card.Text>
                      <Button
                        variant="danger"
                        onClick={() => handleLike(post._id)}
                        className="me-2"
                      >
                        ❤️ {post.likes ? post.likes.length : 0}
                      </Button>
                      <div className="d-flex justify-content-between align-items-center">
                        <Link to={`/post/${post._id}`}>
                          <Button variant="info" className="me-2">Read More</Button>
                        </Link>
                        {user && user._id === post.user && (
                          <div>
                            <Link to={`/edit/${post._id}`}>
                              <Button variant="warning" className="me-2">Edit</Button>
                            </Link>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(post._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </>
      )}
    </Container>
  );
}

/*
<Button>
variant="danger"
onClick={() => handleLike(post._id)}
className="me-2"
>
❤️ {post.likes ? post.likes.length : 0}
</Button>*/

export default Home;
