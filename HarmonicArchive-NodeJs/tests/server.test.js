const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../server.js'); // Import your server

describe('Music Sheets API', () => {
  // Test GET /api/sheets
  it('should return all music sheets', async () => {
    const response = await request(app).get('/api/sheets');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0); // Ensure there are sheets
  });

  it('should filter music sheets by genre', async () => {
    const response = await request(app).get('/api/sheets?genres=Classical');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    response.body.forEach(sheet => {
      expect(sheet.genres).toContain('Classical');
    });
  });

  it('should filter music sheets by instrument', async () => {
    const response = await request(app).get('/api/sheets?instruments=Piano');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    response.body.forEach(sheet => {
      expect(sheet.instruments).toContain('Piano');
    });
  });

  it('should filter music sheets by search query', async () => {
    const response = await request(app).get('/api/sheets?q=Sample');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    response.body.forEach(sheet => {
      expect(sheet.title.toLowerCase()).toContain('sample');
    });
  });

  it('should sort music sheets by title in ascending order', async () => {
    const response = await request(app).get('/api/sheets?_sort=title&_order=asc');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    for (let i = 1; i < response.body.length; i++) {
      expect(response.body[i - 1].title <= response.body[i].title).toBe(true);
    }
  });

  it('should sort music sheets by year in descending order', async () => {
    const response = await request(app).get('/api/sheets?_sort=year&_order=desc');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    for (let i = 1; i < response.body.length; i++) {
      expect(response.body[i - 1].year >= response.body[i].year).toBe(true);
    }
  });

  // Test GET /api/sheets/:id
  it('should return a single music sheet by ID', async () => {
    const response = await request(app).get('/api/sheets/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
  });

  it('should return 404 if music sheet is not found', async () => {
    const response = await request(app).get('/api/sheets/999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Sheet not found');
  });

  // Test POST /api/sheets
  it('should create a new music sheet', async () => {
    const newSheet = {
      title: 'New Composition',
      composer: 'Jane Doe',
      year: 2021,
      key: 'G Major',
      genres: ['Pop'],
      instruments: ['Guitar'],
      link: '/new-composition.pdf',
    };

    const response = await request(app).post('/api/sheets').send(newSheet);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toMatchObject(newSheet);
  });

  it('should return 400 for invalid music sheet data', async () => {
    const invalidSheet = {
      title: '',
      composer: 'Jane Doe',
      year: 'invalid-year',
      key: 'G Major',
      genres: ['Pop'],
      instruments: ['Guitar'],
    };

    const response = await request(app).post('/api/sheets').send(invalidSheet);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  // Test PATCH /api/sheets/:id
  it('should update an existing music sheet', async () => {
    const updatedData = {
      title: 'Updated Composition',
    };

    const response = await request(app).patch('/api/sheets/1').send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('title', 'Updated Composition');
  });

  it('should return 404 if trying to update a non-existent music sheet', async () => {
    const response = await request(app).patch('/api/sheets/999').send({ title: 'Non-existent' });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Sheet not found');
  });

  // Test DELETE /api/sheets/:id
  it('should delete a music sheet by ID', async () => {
    const response = await request(app).delete('/api/sheets/1');
    expect(response.status).toBe(204);
  });

  it('should return 404 if trying to delete a non-existent music sheet', async () => {
    const response = await request(app).delete('/api/sheets/999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Sheet not found');
  });

  it('should handle invalid sort parameters gracefully', async () => {
    const response = await request(app).get('/api/sheets?_sort=invalidField&_order=asc');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});