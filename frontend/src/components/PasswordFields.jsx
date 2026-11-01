import React from "react";
import { Form } from "react-bootstrap";
export default function PasswordFields({
  password,
  confirmation,
  onPassword,
  onConfirmation,
  prefix = "password",
}) {
  return (
    <>
      <Form.Group controlId={`${prefix}-new`} className="mb-3">
        <Form.Label>New password</Form.Label>
        <Form.Control
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
          value={password}
          onChange={(e) => onPassword(e.target.value)}
        />
        <Form.Text>At least 12 characters. Use a unique passphrase.</Form.Text>
      </Form.Group>
      <Form.Group controlId={`${prefix}-confirm`} className="mb-4">
        <Form.Label>Confirm new password</Form.Label>
        <Form.Control
          type="password"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(e) => onConfirmation(e.target.value)}
        />
      </Form.Group>
    </>
  );
}
