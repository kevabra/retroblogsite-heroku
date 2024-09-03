import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, ListGroup } from 'react-bootstrap';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/posts/${id}`)
      .then(response => setPost(response.data))
      .catch(error => console.error(error));

    // Fetch comments
    axios.get(`${process.env.REACT_APP_API_URL}/posts/${id}/comments`)
      .then(response => setComments(response.data))
      .catch(error => console.log('Error fetching comments', error));
  }, [id]);

  if (!post) return <div>Loading...</div>;

  const handleAddComment = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/posts/${id}/comments`, 
        { content: newComment },
        { headers: { 'x-auth-token': token } }
      );
      setComments(response.data.comments);
      setNewComment('');
      setError('');
      // Refresh the page after adding the comment
      window.location.reload(); 
    } catch (error) {
      setError('Could not add comment - ensure logged in and comment is not empty.');
    }
  };

  return (
    <Container>
      <Card className="my-4">
        <Card.Body>
          <Card.Title>{post.title}</Card.Title>
          <Card.Text>{post.content}</Card.Text>
          <h3>Comments</h3>
          <ListGroup>
            {comments.map(comment => (
              <ListGroup.Item key={comment._id}>
                <strong>{comment.user.username}</strong>: {comment.content}
              </ListGroup.Item>
            ))}
          </ListGroup>

          <Form.Group controlId="formComment" className="mt-3">
            <Form.Label>Add a comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter your comment"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              required
            />
            <Button variant="primary" className="mt-2" onClick={handleAddComment}>
              Post Comment
            </Button>
          </Form.Group>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          <Link to="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PostDetail;

